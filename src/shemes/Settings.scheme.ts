import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;
@Schema()
export class Settings {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: true })
  notifications: boolean;

  @Prop({ default: true })
  notificationEnteringBoard: boolean;

  @Prop({ default: true })
  notificationTasks: boolean;

  @Prop({ default: true })
  notificationMessages: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
