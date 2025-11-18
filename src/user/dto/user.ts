export class RegisterDto {
  playerId:string
  username: string;
  email: string;
  password: string;
}

export class LoginDto {
  playerId:string
  email: string;
  code: string;
  password: string;
}
export class editProfileDto {
  username: string;
  email: string;
  password: string;
  avatar: string;
}
