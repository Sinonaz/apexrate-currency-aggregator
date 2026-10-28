import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

const buildAlert = (
  condition: 'ABOVE' | 'BELOW',
  targetPrice: number,
  currentPrice: number,
) => ({
  id: `${condition}-${targetPrice}`,
  assetId: 'asset-1',
  assetSymbol: 'BTC',
  targetPrice,
  condition,
  telegramChatId: '123',
  isTriggered: false,
  createdAt: new Date(),
  asset: { id: 'asset-1', symbol: 'BTC', currentPrice },
});

describe('AlertsService', () => {
  let service: AlertsService;
  let prisma: {
    priceAlert: { findMany: jest.Mock; update: jest.Mock };
  };
  let telegram: { sendNotification: jest.Mock };

  beforeEach(() => {
    prisma = {
      priceAlert: {
        findMany: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    telegram = { sendNotification: jest.fn().mockResolvedValue(undefined) };
    service = new AlertsService(
      prisma as unknown as PrismaService,
      telegram as unknown as TelegramService,
    );
  });

  describe('checkPriceAlerts', () => {
    it('queries only alerts that have not been triggered yet', async () => {
      prisma.priceAlert.findMany.mockResolvedValue([]);

      await service.checkPriceAlerts();

      expect(prisma.priceAlert.findMany).toHaveBeenCalledWith({
        where: { isTriggered: false },
        include: { asset: true },
      });
    });

    it.each([
      ['ABOVE', 100, 150],
      ['ABOVE', 100, 100],
      ['BELOW', 100, 50],
      ['BELOW', 100, 100],
    ] as const)(
      'triggers %s alert with target %d at price %d',
      async (condition, targetPrice, currentPrice) => {
        const alert = buildAlert(condition, targetPrice, currentPrice);
        prisma.priceAlert.findMany.mockResolvedValue([alert]);

        await service.checkPriceAlerts();

        expect(prisma.priceAlert.update).toHaveBeenCalledWith({
          where: { id: alert.id },
          data: { isTriggered: true },
        });
        expect(telegram.sendNotification).toHaveBeenCalledWith(alert);
      },
    );

    it.each([
      ['ABOVE', 100, 99],
      ['BELOW', 100, 101],
    ] as const)(
      'does not trigger %s alert with target %d at price %d',
      async (condition, targetPrice, currentPrice) => {
        prisma.priceAlert.findMany.mockResolvedValue([
          buildAlert(condition, targetPrice, currentPrice),
        ]);

        await service.checkPriceAlerts();

        expect(prisma.priceAlert.update).not.toHaveBeenCalled();
        expect(telegram.sendNotification).not.toHaveBeenCalled();
      },
    );

    it('marks the alert as triggered before sending the notification', async () => {
      prisma.priceAlert.findMany.mockResolvedValue([
        buildAlert('ABOVE', 100, 200),
      ]);

      await service.checkPriceAlerts();

      expect(prisma.priceAlert.update.mock.invocationCallOrder[0]).toBeLessThan(
        telegram.sendNotification.mock.invocationCallOrder[0],
      );
    });
  });
});
