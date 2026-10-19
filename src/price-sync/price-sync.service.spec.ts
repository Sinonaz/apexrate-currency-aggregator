import { Test, TestingModule } from '@nestjs/testing';
import { PriceSyncService } from './price-sync.service';

describe('PriceSyncService', () => {
  let service: PriceSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceSyncService],
    }).compile();

    service = module.get<PriceSyncService>(PriceSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
