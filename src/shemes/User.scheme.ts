import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
@Schema()
export class User {
  @Prop({ default: '' })
  avatar: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ type: [String], required: true })
  playerIds: string[];

  @Prop({ type: String, default: null })
  password: string | null;

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
