import { IsIn, IsOptional } from 'class-validator';

export class GetAssetHistoryDto {
  @IsOptional()
  @IsIn(['1h', '24h', '7d'])
  timeframe?: '1h' | '24h' | '7d';
}
