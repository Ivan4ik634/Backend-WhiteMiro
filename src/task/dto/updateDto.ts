export class UpdateTaskDto {
  _id: string;
  roomId: string;
  text: string;
  title: string;
  isDone: boolean;
  x: number;
  y: number;
  edge: { from: string; to: string };
}
export class UpdateTaskIsDoneDto {
  _id: string;
  roomId: string;
  isDone: boolean;
}
