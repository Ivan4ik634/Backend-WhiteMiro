import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationService {
  async sendPushNotification(userId: string, title: string, message: string, url?: String, image?: string) {
    try {
      const res = await axios.post(
        'https://api.onesignal.com/notifications?c=push',
        {
          app_id: process.env.ONESIGNAL_API_ID!,
          include_aliases: {
            external_id: [userId],
          },
          headings: { en: title },
          contents: { en: message },
          url: url ? `https://white-miro.vercel.app${url}` : 'https://white-miro.vercel.app',
          chrome_web_icon: 'https://white-miro.vercel.app/White-Miro.png',
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
