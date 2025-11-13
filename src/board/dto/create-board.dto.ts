export class CreateBoardDto {
  text: string;
  title: string;
  tags: string[];
  image: string;
  access: 'locked' | 'public';
  status: 'in planning' | 'action' | 'done' | 'archived';
}
