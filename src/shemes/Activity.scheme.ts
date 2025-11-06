import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActivityDocument = HydratedDocument<Activity>;
@Schema()
export class Activity {
  @Prop({ required: true })
  type: 'create' | 'edit' | 'delete' | 'invite';

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  members: string[];

  @Prop({ required: true })
  text: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
