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

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ type: Date || null, default: null })
  premiumDate: Date | null;

  @Prop({ default: false })
  online: boolean;

  @Prop({ required: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
