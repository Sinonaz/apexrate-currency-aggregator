import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

describe('AssetsController', () => {
  let controller: AssetsController;
  let service: AssetsService;

  const mockAssetsService = {
    getAssets: jest.fn(),
    createAsset: jest.fn(),
    deleteAsset: jest.fn(),
    getAssetHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        {
          provide: AssetsService,
          useValue: mockAssetsService,
        },
      ],
    }).compile();

    controller = module.get<AssetsController>(AssetsController);
    service = module.get<AssetsService>(AssetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteAsset', () => {
    it('should call service.deleteAsset with id', async () => {
      mockAssetsService.deleteAsset.mockResolvedValue({ success: true });

      const result = await controller.deleteAsset('test-id');

      expect(mockAssetsService.deleteAsset).toHaveBeenCalledWith('test-id');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getAssetHistory', () => {
    it('should call service.getAssetHistory with id and timeframe', async () => {
      const mockHistory = [{ price: 50000, timestamp: new Date() }];
      mockAssetsService.getAssetHistory.mockResolvedValue(mockHistory);

      const result = await controller.getAssetHistory('test-id', {
        timeframe: '24h',
      });

      expect(mockAssetsService.getAssetHistory).toHaveBeenCalledWith(
        'test-id',
        '24h',
      );
      expect(result).toEqual(mockHistory);
    });
  });
});
