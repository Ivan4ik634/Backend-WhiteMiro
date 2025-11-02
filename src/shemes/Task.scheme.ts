import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;
@Schema()
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: false })
  isDone: boolean;

  @Prop({
    type: [{ from: Types.ObjectId, to: Types.ObjectId }],
    ref: 'Task',
    default: [],
  })
  edges: { from: Types.ObjectId; to: Types.ObjectId }[];

  @Prop({ type: Number, required: true })
  x: number;

  @Prop({ type: Number, required: true })
  y: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
