import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
@Schema()
export class User {
  @Prop({ default: '' })
  avatar: string;

  @Prop({ required: true })
  username: string;

  @Prop({ type: String, default: null })
  password: string | null;

  @Prop({ type: String || null, default: null })
  totpSecret: string | null;

  @Prop({ default: false })
  isTotpEnabled: boolean;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ type: String || null, default: null })
  stripeCustomerId: string | null;

  @Prop({ type: String || null, default: null })
  subscriptionCancelled: boolean | null;

  @Prop({ type: String || null, default: null })
  subscriptionId: string | null;

  @Prop({ default: false })
  online: boolean;

  @Prop({ required: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
