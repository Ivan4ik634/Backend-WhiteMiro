import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;
@Schema()
export class Message {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  roomId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
