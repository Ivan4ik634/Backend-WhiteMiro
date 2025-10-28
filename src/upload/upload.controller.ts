import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/file')
  @UseInterceptors(FileInterceptor('file'))
  async UploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file, false);

    return { url };
  }
  @Post('/audio')
  @UseInterceptors(FileInterceptor('audio'))
  async UploadAudio(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file, true);

    return { url };
  }
}
