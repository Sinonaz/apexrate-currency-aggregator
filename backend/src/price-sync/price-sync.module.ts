import { Module } from '@nestjs/common';
import { PriceSyncService } from './price-sync.service';
import { FiatRateService } from './fiat-rate.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CRYPTO_HTTP_SERVICE, FIAT_HTTP_SERVICE } from './price-sync.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CRYPTO_HTTP_SERVICE,
      useFactory: (configService: ConfigService) => {
        const axiosInstance = axios.create({
          baseURL: configService.get<string>('COINGECKO_API_URL'),
          headers: {
            'x-cg-demo-api-key': configService.get<string>('COINGECKO_API_KEY'),
          },
        });
        return new HttpService(axiosInstance as never);
      },
      inject: [ConfigService],
    },
    {
      provide: FIAT_HTTP_SERVICE,
      useFactory: (configService: ConfigService) => {
        const axiosInstance = axios.create({
          baseURL: configService.get<string>('FIAT_API_URL'),
        });
        return new HttpService(axiosInstance as never);
      },
      inject: [ConfigService],
    },
    PriceSyncService,
    FiatRateService,
  ],
  exports: [PriceSyncService, FiatRateService],
})
export class PriceSyncModule {}
