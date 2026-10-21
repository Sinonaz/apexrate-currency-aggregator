import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

type Alert = Prisma.PriceAlertGetPayload<{
  include: {
    asset: true;
  };
}>;

@Injectable()
export class TelegramService {
  private readonly url: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.url = `https://api.telegram.org/bot${token}/sendMessage`;
  }

  async sendNotification(alert: Alert) {
    await firstValueFrom(
      this.httpService.post(this.url, {
        chat_id: alert.telegramChatId,
        text: `🚨 *ApexRate Alert!* \n\nAsset: *${alert.asset.symbol}*\nCurrent Price: *$${alert.asset.currentPrice}*\nTarget: *${alert.condition} $${alert.targetPrice}*`,
        parse_mode: 'Markdown',
      }),
    );
  }
}
