export class RegisterDto {
  username: string;
  playerId: string;
  email: string;
  password: string;
}

export class LoginDto {
  email: string;
  playerId: string;
  code: string;
  password: string;
}
export class editProfileDto {
  username: string;
  email: string;
  password: string;
  avatar: string;
}
