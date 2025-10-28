import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationService {
  async sendPushNotification(
    playerIds: string[],
    title: string,
    message: string,
    url?: String,
    image?: string,
  ) {
    try {
      const res = await axios.post(
        'https://api.onesignal.com/notifications?c=push',
        {
          app_id: '843913d7-6e97-42a2-9aac-62fe3c27b9a1',
          include_player_ids: playerIds,
          headings: { en: title },
          contents: { en: message },
          url: url
            ? `https://white-youtube.vercel.app${url}`
            : 'https://white-youtube.vercel.app',
          chrome_web_icon: 'https://white-youtube.vercel.app/icons/icon.png',
          chrome_web_image: image ? image : '',
        },
        {
          headers: {
            accept: 'application/json',
            Authorization:
              'Key os_v2_app_qq4rhv3os5bkfgvmml7dyj5zuhvowilxf2welxnnwqj3pju46bqoup3op5ogavfnsanldyai44zuyadsm2qzb4ml453jffdnm4ozeiy',
            'content-type': 'application/json',
          },
        },
      );
      return res.data;
    } catch (err) {
      console.error('Push error:', err.response?.data || err.message);
    }
  }
}
