import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from 'src/shemes/Payment.schema';
import { User } from 'src/shemes/User.scheme';
import Stripe from 'stripe';

@Injectable()
// API STRAPI
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private payment: Model<Payment>,
    @InjectModel(User.name) private user: Model<User>,
  ) {
    this.stripe = new Stripe(process.env.STRAPI_API_KEY!);
  }

  async createCheckoutSession(amount: number, userId: string) {
    const user = await this.user.findById(userId);
    if (!user) return;
    if (!user.stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
      });

      await this.user.updateOne({ _id: user._id }, { stripeCustomerId: customer.id });
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: 'price_1SSERIIC3cRUAUYki87nkI4i', quantity: 1 }],
      customer: user.stripeCustomerId!,
      success_url: `https://white-miro.vercel.app/app/settings`,
      cancel_url: `https://white-miro.vercel.app/app/settings`,
    });

    return session;
  }
  async successPayment(body: { paymentId: string }, userId: string) {
    const payment = await this.payment.findOneAndUpdate(
      { paymentId: body.paymentId, status: 'pending' },
      { status: 'success' },
    );

    if (!payment) return 'Payment not found or already processed';
    if (String(payment.userId) !== userId) return 'You can`t pay for yourself';

    const user = await this.user.findById(userId);
    if (!user) return 'User not found';

    return { message: 'Payment processed successfully' };
  }

  async cancelPayment(paymentId: string, userId: string) {
    const payment = await this.payment.findOne({ paymentId: paymentId });
    if (!payment) return 'Payment not found';
    if (payment.status === 'pending') {
      const user = await this.user.findById(userId);

      if (!user) return 'User not found';
      if (String(user._id) !== payment.userId) return 'You can`t pay for yourself';
      await this.payment.updateOne({ paymentId: paymentId }, { status: 'error' });
      await payment.save();
      return 'Payment canceled!';
    }
  }
  async cancelPremium(userId: string) {
    const user = await this.user.findById(userId);
    if (!user || !user.subscriptionId) return 'User not found';
    const subscription = await this.stripe.subscriptions.update(
      user.subscriptionId,
      { cancel_at_period_end: true }, // отмена в конце оплаченного периода
    );

    await this.user.updateOne({ _id: user._id }, { subscriptionCancelled: true });
    return 'Cancel premium canceled!';
  }
  async webHook(req, res) {
    const signature = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Event', event);
    console.log('Event type', event.type);

    if (event.type === 'checkout.session.completed') {
      const subscription = event.data.object as Stripe.Checkout.Session;
      const customerId = subscription.customer as string;
      const status = subscription.status;

      const subscriptionId = subscription.subscription;

      console.log('Status', status);
      console.log('CustomerId', customerId);
      console.log('Subscription', subscription);

      const user = await this.user.findOne({ stripeCustomerId: customerId });
      if (user) {
        if (status === 'complete') {
          await this.user.updateOne(
            { _id: user._id },
            { isPremium: true, subscriptionId, subscriptionCancelled: false },
          );
        } else {
          await this.user.updateOne(
            { _id: user._id },
            { isPremium: false, subscriptionId: null, subscriptionCancelled: null },
          );
        }
      }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const user = await this.user.findOne({ stripeCustomerId: customerId });
      if (!user) return;

      if (subscription.cancel_at_period_end) {
        await this.user.updateOne(
          { _id: user._id },
          { subscriptionId: null, subscriptionCancelled: null, isPremium: false },
        );
      } else {
        await this.user.updateOne({ _id: user._id }, { isPremium: true });
      }
    }

    return res.status(200).send('OK');
  }
}
