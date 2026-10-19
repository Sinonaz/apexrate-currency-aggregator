import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AssetsService', () => {
  let service: AssetsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    asset: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    pricePoint: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAssetHistory', () => {
    it('should query price points with default 24h timeframe', async () => {
      const mockResult = [{ price: 100, timestamp: new Date() }];
      mockPrismaService.pricePoint.findMany.mockResolvedValue(mockResult);

      const result = await service.getAssetHistory('test-id');

      expect(mockPrismaService.pricePoint.findMany).toHaveBeenCalledWith({
        where: {
          assetId: 'test-id',
          timestamp: {
            gte: expect.any(Date),
          },
        },
        select: {
          price: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle 1h and 7d timeframe', async () => {
      mockPrismaService.pricePoint.findMany.mockResolvedValue([]);

      await service.getAssetHistory('test-id', '1h');
      expect(mockPrismaService.pricePoint.findMany).toHaveBeenCalled();

      await service.getAssetHistory('test-id', '7d');
      expect(mockPrismaService.pricePoint.findMany).toHaveBeenCalled();
    });
  });
});
