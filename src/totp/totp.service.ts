import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import qrcode from 'qrcode';
import speakeasy from 'speakeasy';
import { User } from 'src/shemes/User.scheme';

@Injectable()
export class TotpService {
  constructor(@InjectModel(User.name) private readonly user: Model<User>) {}
  async generate(userId: string) {
    const user = await this.user.findById(userId);
    if (!user) return { user: 'User not found' };
    const secret = speakeasy.generateSecret({
      name: `White miro | ${user.username}`, // будет видно в приложении
      length: 20,
    });
    await this.user.updateOne({ _id: user._id }, { totpSecret: secret.base32 });

    const qr = await qrcode.toDataURL(secret.otpauth_url);

    return { qr, secret: secret.base32 };
  }
  async verify(userId: string, token: string) {
    const user = await this.user.findById(userId);
    if (!user) return false;
    const secret = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token,
    });
    if (!secret) return false;
    if (!user.isTotpEnabled) {
      await this.user.updateOne({ _id: user._id }, { isTotpEnabled: true });
    }

    return true;
  }
  async cancel(userId: string) {
    const user = await this.user.findById(userId);
    if (!user) return { user: 'User not found' };
    await this.user.updateOne({ _id: user._id }, { isTotpEnabled: false, totpSecret: null });

    return { message: 'Canceled totp' };
  }
}
