import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AssetType } from '../enums/asset-type.enum';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AssetType)
  @IsOptional()
  type?: AssetType;

  @IsString()
  @IsNotEmpty()
  providerId: string;
}
