import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { AssetType } from '../assets/enums/asset-type.enum';
import { FiatRateService } from './fiat-rate.service';
import { CRYPTO_HTTP_SERVICE } from './price-sync.constants';

interface CoinGeckoPriceResponse {
  [providerId: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

export interface AssetValidationResult {
  exists: boolean;
  currentPrice?: number;
  change24h?: number;
}

@Injectable()
export class PriceSyncService {
  private readonly logger = new Logger(PriceSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CRYPTO_HTTP_SERVICE) private readonly httpService: HttpService,
    private readonly fiatRateService: FiatRateService,
  ) {}

  @Cron('*/5 * * * *')
  async syncPrices() {
    this.logger.log('Syncing prices');

    await Promise.allSettled([this.syncCryptoPrices(), this.syncFiatPrices()]);
  }

  async syncCryptoPrices() {
    try {
      const cryptoAssets = await this.prisma.asset.findMany({
        where: { type: AssetType.CRYPTO },
      });

      if (cryptoAssets.length === 0) {
        this.logger.warn('No crypto assets found');
        return;
      }

      const ids = cryptoAssets.map((asset) => asset.providerId).join(',');
      const { data } = await firstValueFrom(
        this.httpService.get<CoinGeckoPriceResponse>('simple/price', {
          params: {
            ids,
            vs_currencies: 'usd',
            include_24h_change: true,
          },
        }),
      );

      for (const asset of cryptoAssets) {
        const coinData = data[asset.providerId];

        if (!coinData || coinData.usd === undefined) {
          this.logger.warn(
            `No price data found for crypto asset ${asset.providerId}`,
          );
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

        this.logger.debug(
          `Price data synced for crypto asset ${asset.providerId}`,
        );
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const stack = e instanceof Error ? e.stack : undefined;
      this.logger.error(`Error syncing crypto prices: ${message}`, stack);
    }
  }

  async syncFiatPrices() {
    try {
      const fiatAssets = await this.prisma.asset.findMany({
        where: { type: AssetType.FIAT },
      });

      if (fiatAssets.length === 0) {
        this.logger.warn('No fiat assets found');
        return;
      }

      const rates = await this.fiatRateService.getLatestRates();

      for (const asset of fiatAssets) {
        const currencyKey = asset.providerId.toUpperCase();
        const rate = rates[currencyKey];

        if (rate === undefined || rate === null) {
          this.logger.warn(
            `No price data found for fiat asset ${asset.providerId} (key: ${currencyKey})`,
          );
          continue;
        }

        const currentPrice = rate;

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        let prevPricePoint = await this.prisma.pricePoint.findFirst({
          where: {
            assetId: asset.id,
            timestamp: { lte: twentyFourHoursAgo },
          },
          orderBy: { timestamp: 'desc' },
        });

        if (!prevPricePoint) {
          prevPricePoint = await this.prisma.pricePoint.findFirst({
            where: { assetId: asset.id },
            orderBy: { timestamp: 'asc' },
          });
        }

        let change24h = 0;
        if (prevPricePoint && prevPricePoint.price > 0) {
          change24h =
            ((currentPrice - prevPricePoint.price) / prevPricePoint.price) *
            100;
          change24h = Math.round(change24h * 100) / 100;
        }

        await this.prisma.$transaction([
          this.prisma.asset.update({
            where: {
              id: asset.id,
            },
            data: {
              currentPrice,
              change24h,
            },
          }),
          this.prisma.pricePoint.create({
            data: {
              assetId: asset.id,
              price: currentPrice,
            },
          }),
        ]);

        this.logger.debug(
          `Price data synced for fiat asset ${asset.providerId}`,
        );
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const stack = e instanceof Error ? e.stack : undefined;
      this.logger.error(`Error syncing fiat prices: ${message}`, stack);
    }
  }

  async validateAndFetchCrypto(
    providerId: string,
  ): Promise<AssetValidationResult> {
    try {
      const normalizedId = providerId.trim().toLowerCase();
      const { data } = await firstValueFrom(
        this.httpService.get<CoinGeckoPriceResponse>('simple/price', {
          params: {
            ids: normalizedId,
            vs_currencies: 'usd',
            include_24h_change: true,
          },
        }),
      );

      const coinData = data?.[normalizedId];
      if (!coinData || coinData.usd === undefined || coinData.usd === null) {
        return { exists: false };
      }

      return {
        exists: true,
        currentPrice: coinData.usd,
        change24h: coinData.usd_24h_change ?? 0,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to validate crypto providerId "${providerId}": ${message}`,
      );
      return { exists: false };
    }
  }

  async validateAndFetchFiat(
    providerId: string,
  ): Promise<AssetValidationResult> {
    try {
      const rates = await this.fiatRateService.getLatestRates();
      const currencyKey = providerId.trim().toUpperCase();
      const rate = rates[currencyKey];

      if (rate === undefined || rate === null) {
        return { exists: false };
      }

      return {
        exists: true,
        currentPrice: rate,
        change24h: 0,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to validate fiat currency "${providerId}": ${message}`,
      );
      return { exists: false };
    }
  }
}
