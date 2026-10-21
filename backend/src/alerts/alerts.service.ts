import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { TelegramService } from '../telegram/telegram.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  async getAlerts() {
    return this.prisma.priceAlert.findMany();
  }

  async createAlert(dto: CreateAlertDto) {
    return this.prisma.priceAlert.create({ data: dto });
  }

  async deleteAlert(id: string) {
    await this.prisma.priceAlert.delete({ where: { id } });

    return { success: true };
  }

  @Cron('*/1 * * * *')
  async checkPriceAlerts() {
    const activeAlerts = await this.prisma.priceAlert.findMany({
      where: {
        isTriggered: false,
      },
      include: {
        asset: true,
      },
    });

    for (const activeAlert of activeAlerts) {
      const currentPrice = activeAlert.asset.currentPrice;
      let shouldTrigger = false;

      if (
        activeAlert.condition === 'ABOVE' &&
        currentPrice >= activeAlert.targetPrice
      ) {
        shouldTrigger = true;
      } else if (
        activeAlert.condition === 'BELOW' &&
        currentPrice <= activeAlert.targetPrice
      ) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        await this.prisma.priceAlert.update({
          where: { id: activeAlert.id },
          data: { isTriggered: true },
        });
        await this.telegramService.sendNotification(activeAlert);
      }
    }
  }
}
