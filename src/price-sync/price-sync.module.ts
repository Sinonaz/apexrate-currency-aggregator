import { Module } from '@nestjs/common';
import { PriceSyncService } from './price-sync.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PriceSyncService],
  exports: [PriceSyncService],
})
export class PriceSyncModule {}
