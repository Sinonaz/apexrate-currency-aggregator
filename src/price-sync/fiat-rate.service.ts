import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FIAT_HTTP_SERVICE } from './price-sync.constants';

export interface ExchangeRateApiResponse {
  result: string;
  provider?: string;
  documentation?: string;
  terms_of_use?: string;
  time_last_update_unix?: number;
  time_last_update_utc?: string;
  time_next_update_unix?: number;
  time_next_update_utc?: string;
  base_code: string;
  rates: Record<string, number>;
}

@Injectable()
export class FiatRateService {
  private readonly logger = new Logger(FiatRateService.name);

  constructor(
    @Inject(FIAT_HTTP_SERVICE) private readonly httpService: HttpService,
  ) {}

  async getLatestRates(): Promise<Record<string, number>> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ExchangeRateApiResponse>('latest/USD'),
      );

      if (data.result !== 'success' || !data.rates) {
        this.logger.warn(
          `ExchangeRate API returned unexpected response: ${JSON.stringify(data)}`,
        );
        return {};
      }

      return data.rates;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to fetch fiat exchange rates: ${message}`,
        stack,
      );
      throw error;
    }
  }
}
