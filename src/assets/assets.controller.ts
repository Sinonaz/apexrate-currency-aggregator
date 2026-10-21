import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { GetAssetHistoryDto } from './dto/get-asset-history.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  getAssets() {
    return this.assetsService.getAssets();
  }

  @Post()
  createAsset(@Body() dto: CreateAssetDto) {
    return this.assetsService.createAsset(dto);
  }

  @Delete(':id')
  deleteAsset(@Param('id') id: string) {
    return this.assetsService.deleteAsset(id);
  }

  @Get(':id/history')
  getAssetHistory(
    @Param('id') id: string,
    @Query() query: GetAssetHistoryDto,
  ) {
    return this.assetsService.getAssetHistory(id, query.timeframe);
  }
}
