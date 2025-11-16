export class RegisterDto {
  username: string;
  email: string;
  password: string;
}

export class LoginDto {
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
