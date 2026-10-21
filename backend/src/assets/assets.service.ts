import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PriceSyncService } from '../price-sync/price-sync.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AssetType } from './enums/asset-type.enum';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly priceSyncService: PriceSyncService,
  ) {}

  async getAssets() {
    return this.prisma.asset.findMany();
  }

  async createAsset(dto: CreateAssetDto) {
    const symbol = dto.symbol.trim();
    const providerId = dto.providerId.trim();
    const type = dto.type ?? AssetType.CRYPTO;

    const existingAsset = await this.prisma.asset.findFirst({
      where: {
        OR: [{ symbol }, { providerId, type }],
      },
    });

    if (existingAsset) {
      if (existingAsset.symbol.toLowerCase() === symbol.toLowerCase()) {
        throw new ConflictException(
          `Asset with symbol "${symbol}" already exists`,
        );
      }
      throw new ConflictException(
        `Asset with provider ID "${providerId}" and type "${type}" already exists`,
      );
    }

    const validation =
      type === AssetType.CRYPTO
        ? await this.priceSyncService.validateAndFetchCrypto(providerId)
        : await this.priceSyncService.validateAndFetchFiat(providerId);

    if (!validation.exists) {
      throw new BadRequestException(
        `Asset with provider ID "${providerId}" was not found on the exchange/provider (${type})`,
      );
    }

    const currentPrice = validation.currentPrice ?? 0;
    const change24h = validation.change24h ?? 0;

    try {
      return await this.prisma.asset.create({
        data: {
          symbol,
          name: dto.name.trim(),
          type,
          providerId,
          currentPrice,
          change24h,
          history:
            validation.currentPrice !== undefined
              ? {
                  create: {
                    price: currentPrice,
                  },
                }
              : undefined,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Asset with symbol "${symbol}" already exists`,
        );
      }
      throw error;
    }
  }

  async deleteAsset(id: string) {
    await this.prisma.asset.delete({
      where: { id },
    });
    return { success: true };
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
