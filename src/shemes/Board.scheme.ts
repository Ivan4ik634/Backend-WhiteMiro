import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BoardDocument = HydratedDocument<Board>;
@Schema()
export class Board {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  text: string;

  @Prop({ types: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[];

  @Prop({ types: [String], default: [] })
  liked: string[];

  @Prop({ default: 0 })
  tasksDone: number;

  @Prop({ default: 0 })
  tasks: number;

  @Prop({ default: 'locked' })
  access: 'locked' | 'public';

  @Prop({ default: 'in planning' })
  status: 'in planning' | 'action' | 'done' | 'archived';

  @Prop({ default: '' })
  image: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
