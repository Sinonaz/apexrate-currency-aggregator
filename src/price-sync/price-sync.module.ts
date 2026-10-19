import { Module } from '@nestjs/common';
import { PriceSyncService } from './price-sync.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('COINGECKO_API_URL'),
        headers: {
          'x-cg-demo-api-key': configService.get<string>('COINGECKO_API_KEY'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PriceSyncService],
  exports: [PriceSyncService],
})
export class PriceSyncModule {}
