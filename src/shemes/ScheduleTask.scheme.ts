import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ScheduleTaskDocument = HydratedDocument<ScheduleTask>;
@Schema()
export class ScheduleTask {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: 0 })
  tasksDone: number;

  @Prop({ type:String })
  createdAt: string;
}

export const ScheduleTaskSchema = SchemaFactory.createForClass(ScheduleTask);
