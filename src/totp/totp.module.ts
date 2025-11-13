import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/shemes/User.scheme';
import { TotpController } from './totp.controller';
import { TotpService } from './totp.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [TotpController],
  providers: [TotpService, JwtService],
  exports: [TotpService],
})
export class TotpModule {}
