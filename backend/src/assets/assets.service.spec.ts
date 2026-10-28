import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AssetsService } from './assets.service';
import { AssetType } from './enums/asset-type.enum';
import { PrismaService } from '../prisma/prisma.service';
import { PriceSyncService } from '../price-sync/price-sync.service';

describe('AssetsService', () => {
  let service: AssetsService;
  let prisma: {
    asset: { findFirst: jest.Mock; create: jest.Mock };
    pricePoint: { findMany: jest.Mock };
  };
  let priceSync: {
    validateAndFetchCrypto: jest.Mock;
    validateAndFetchFiat: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      asset: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest
          .fn()
          .mockImplementation(({ data }: { data: unknown }) => data),
      },
      pricePoint: { findMany: jest.fn().mockResolvedValue([]) },
    };
    priceSync = {
      validateAndFetchCrypto: jest.fn(),
      validateAndFetchFiat: jest.fn(),
    };
    service = new AssetsService(
      prisma as unknown as PrismaService,
      priceSync as unknown as PriceSyncService,
    );
  });

  describe('createAsset', () => {
    it('validates crypto by default and stores the initial price point', async () => {
      priceSync.validateAndFetchCrypto.mockResolvedValue({
        exists: true,
        currentPrice: 0.15,
        change24h: 2.5,
      });

      await service.createAsset({
        symbol: ' DOGE ',
        name: ' Dogecoin ',
        providerId: ' dogecoin ',
      });

      expect(priceSync.validateAndFetchCrypto).toHaveBeenCalledWith('dogecoin');
      expect(priceSync.validateAndFetchFiat).not.toHaveBeenCalled();
      expect(prisma.asset.create).toHaveBeenCalledWith({
        data: {
          symbol: 'DOGE',
          name: 'Dogecoin',
          type: AssetType.CRYPTO,
          providerId: 'dogecoin',
          currentPrice: 0.15,
          change24h: 2.5,
          history: { create: { price: 0.15 } },
        },
      });
    });

    it('validates fiat assets through the fiat provider', async () => {
      priceSync.validateAndFetchFiat.mockResolvedValue({
        exists: true,
        currentPrice: 0.79,
        change24h: 0,
      });

      await service.createAsset({
        symbol: 'USD/GBP',
        name: 'British Pound',
        type: AssetType.FIAT,
        providerId: 'gbp',
      });

      expect(priceSync.validateAndFetchFiat).toHaveBeenCalledWith('gbp');
      expect(priceSync.validateAndFetchCrypto).not.toHaveBeenCalled();
    });

    it('rejects an asset the provider does not know', async () => {
      priceSync.validateAndFetchCrypto.mockResolvedValue({ exists: false });

      await expect(
        service.createAsset({
          symbol: 'FAKE',
          name: 'Fake',
          providerId: 'fake',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.asset.create).not.toHaveBeenCalled();
    });

    it('rejects a duplicate symbol without calling the provider', async () => {
      prisma.asset.findFirst.mockResolvedValue({
        symbol: 'BTC',
        providerId: 'bitcoin',
      });

      await expect(
        service.createAsset({
          symbol: 'btc',
          name: 'Bitcoin',
          providerId: 'bitcoin',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(priceSync.validateAndFetchCrypto).not.toHaveBeenCalled();
    });

    it('maps a unique constraint race (P2002) to ConflictException', async () => {
      priceSync.validateAndFetchCrypto.mockResolvedValue({
        exists: true,
        currentPrice: 1,
      });
      prisma.asset.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.createAsset({
          symbol: 'ADA',
          name: 'Cardano',
          providerId: 'cardano',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('getAssetHistory', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-08T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it.each([
      ['1h', '2026-01-07T23:00:00.000Z'],
      ['24h', '2026-01-07T00:00:00.000Z'],
      ['7d', '2026-01-01T00:00:00.000Z'],
      [undefined, '2026-01-07T00:00:00.000Z'],
    ])(
      'uses the right start date for timeframe %s',
      async (timeframe, from) => {
        await service.getAssetHistory('asset-1', timeframe);

        expect(prisma.pricePoint.findMany).toHaveBeenCalledWith({
          where: { assetId: 'asset-1', timestamp: { gte: new Date(from) } },
          select: { price: true, timestamp: true },
          orderBy: { timestamp: 'asc' },
        });
      },
    );
  });
});
