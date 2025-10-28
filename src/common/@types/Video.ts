import { Types } from 'mongoose';

export type VideoT = {
  userId: Types.ObjectId;
  preview: string;

  isCommentDisabled: boolean;

  video: string;
  title: string;
  description: string;
  tags: string[];

  likes: Types.ObjectId[];
  views: number;
  Comments: Types.ObjectId[];
};
