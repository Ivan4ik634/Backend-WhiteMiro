import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsSchema } from 'src/shemes/Settings.scheme';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
