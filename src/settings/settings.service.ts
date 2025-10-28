import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Settings } from 'http2';
import { Model } from 'mongoose';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/shemes/User.scheme';
import { UpdateSettingsDto } from './dto/update.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel('Settings') private readonly settingsModel: Model<Settings>,
  ) {}
  async settingsUpdate(userId: string, body: UpdateSettingsDto) {
    const settings = await this.settingsModel.findOne({ userId: userId });
    await this.settingsModel.updateOne({ userId }, { ...body });
    return settings;
  }
}
