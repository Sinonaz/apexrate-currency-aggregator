import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PriceSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  @Cron('*/2 * * * *')
  async syncPrices() {}
}
