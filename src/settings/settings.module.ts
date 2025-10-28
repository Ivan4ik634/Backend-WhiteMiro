import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsSchema } from 'src/shemes/Settings.scheme';
import { UserSchema } from 'src/shemes/User.scheme';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, JwtService],
})
export class SettingsModule {}
