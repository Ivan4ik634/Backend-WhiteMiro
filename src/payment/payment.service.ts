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
      success_url: `https://white-miro.vercel.app/app/settings`,
      cancel_url: `https://white-miro.vercel.app/app/settings`,
    });

    return session; // редиректить сюда
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
    if (!user || !user.stripeCustomerId) return 'User not found';
    const subscription = await this.stripe.subscriptions.update(
      user.stripeCustomerId,
      { cancel_at_period_end: true }, // отмена в конце оплаченного периода
    );

    await this.user.updateOne({ _id: user._id }, { subscriptionCancelled: true });
    return 'Cancel premium canceled!';
  }
  async webHook(req, signature: string) {
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const status = subscription.status;

      const user = await this.user.findOne({ stripeCustomerId: customerId });
      if (!user) return;

      if (status === 'active') {
        await this.user.updateOne({ _id: user._id }, { isPremium: true, subscriptionCancelled: false });
      } else {
        await this.user.updateOne({ _id: user._id }, { isPremium: false, subscriptionCancelled: null });
      }
    }
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const user = await this.user.findOne({ stripeCustomerId: customerId });
      if (!user) return;
      await this.user.updateOne({ _id: user._id }, { isPremium: false, subscriptionCancelled: null });
    }

    return new Response('OK', { status: 200 });
  }
}
