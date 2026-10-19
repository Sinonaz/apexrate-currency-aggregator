import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssets() {
    return this.prisma.asset.findMany();
  }

  async createAsset(dto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: dto,
    });
  }

  async getAssetHistory(id: string, timeframe: string = '24h') {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '24h':
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }

    return this.prisma.pricePoint.findMany({
      where: {
        assetId: id,
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        price: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
  }
}
