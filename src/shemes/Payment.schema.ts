import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;
@Schema()
export class Payment {
  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, required: true })
  paymentId: string;

  @Prop({ required: true })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: true })
  userId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
