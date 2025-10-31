export class UpdateTaskDto {
  _id: string;
  userId: string;
  roomId: string;
  text: string;
  isDone: boolean;
  x: number;
  y: number;
  edge: { from: string; to: string };
}
export class UpdateTaskIsDoneDto {
  _id: string;
  userId: string;
  roomId: string;
  isDone: boolean;
}
