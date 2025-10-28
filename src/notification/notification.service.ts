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
          app_id: process.env.ONESIGNAL_API_ID!,
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
            Authorization: `Key ${process.env.ONESIGNAL_API_SECRET!}`,
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
