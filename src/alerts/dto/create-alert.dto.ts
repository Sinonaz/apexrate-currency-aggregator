import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateAlertDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsNumber()
  @IsPositive()
  targetPrice: number;

  @IsEnum(['ABOVE', 'BELOW'])
  condition: 'ABOVE' | 'BELOW';

  @IsString()
  @IsNotEmpty()
  telegramChatId: string;

  @IsString()
  @IsNotEmpty()
  assetSymbol: string;
}
