import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { User } from 'src/shemes/User.scheme';

@Injectable()
export class NotificationService {
  constructor(@InjectModel(User.name) private readonly user: Model<User>) {}
  async sendPushNotification(userId: string, title: string, message: string, url?: String, image?: string) {
    const user = await this.user.findById(userId);
    if (!user) return;
    try {
      const res = await axios.post(
        'https://api.onesignal.com/notifications?c=push',
        {
          app_id: process.env.ONESIGNAL_API_ID!,
          include_subscription_ids: user?.playerIds,
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
