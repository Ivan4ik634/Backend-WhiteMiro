import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

cloudinary.config({
  cloud_name: 'dshkbuopu',
  api_key: '511749955766279',
  api_secret: '90_uRqgavznEzTGwTDle6ZVQBZ4',
});
@Injectable()
export class UploadService {
  constructor() {}

  uploadFile(file: Express.Multer.File, isVideo: boolean) {
    const cleanedOriginalName = file.originalname
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/&/g, 'and')
      .replace(/\s+/g, '_');

    console.log(cleanedOriginalName);
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'uploads',
          resource_type: isVideo ? 'video' : 'image',
          allowed_formats: !isVideo ? ['jpg', 'jpeg', 'png'] : ['mp4', 'mp3'],
          public_id: cleanedOriginalName.split('.')[0],
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading file to Cloudinary:', error);
            return reject(error);
          }
          resolve(result!.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
