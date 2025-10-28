import { Types } from 'mongoose';

export type CommentT = {
  userId: Types.ObjectId;
  likes: number[];
  dislikes: number[];
  videoId: Types.ObjectId;
};
