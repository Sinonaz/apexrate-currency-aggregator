import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';

interface CoinGeckoPriceResponse {
  [providerId: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

@Injectable()
export class PriceSyncService {
  private readonly logger = new Logger(PriceSyncService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  @Cron('*/2 * * * *')
  async syncPrices() {
    this.logger.log('Syncing prices');

    try {
      const assets = await this.prisma.asset.findMany();

      if (assets.length === 0) {
        this.logger.warn('No assets found');

        return;
      }

      const ids = assets.map((asset) => asset.providerId).join(',');
      const { data } = await firstValueFrom(
        this.httpService.get<CoinGeckoPriceResponse>('simple/price', {
          params: {
            ids,
            vs_currencies: 'usd',
            include_24h_change: true,
          },
        }),
      );

      for (const asset of assets) {
        const coinData = data[asset.providerId];

        if (!coinData || coinData.usd === undefined) {
          this.logger.warn(`No price data found for asset ${asset.providerId}`);

          continue;
        }

        const currentPrice = coinData.usd;
        const currentPriceChange = coinData.usd_24h_change ?? 0;

        await this.prisma.$transaction([
          this.prisma.asset.update({
            where: {
              id: asset.id,
            },
            data: {
              currentPrice,
              change24h: currentPriceChange,
            },
          }),
          this.prisma.pricePoint.create({
            data: {
              assetId: asset.id,
              price: currentPrice,
            },
          }),
        ]);

        this.logger.debug(`Price data synced for asset ${asset.providerId}`);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
