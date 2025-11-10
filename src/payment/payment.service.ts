import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
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
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Purchase the premium version',
            },
            unit_amount: amount * 100, // в центах
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
      success_url: `https://white-miro.vercel.app/payment/success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `https://white-miro.vercel.app/payment/cancel/{CHECKOUT_SESSION_ID}`,
    });

    await this.payment.create({ paymentId: session.id, status: 'pending', amount, userId: user._id });
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

    const premiumDate = dayjs().add(1, 'month').format('YYYY-MM-DD');
    await this.user.findOneAndUpdate({ _id: user._id }, { isPremium: true, premiumDate });

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
}
