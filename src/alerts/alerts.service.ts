import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlerts() {
    return this.prisma.priceAlert.findMany();
  }

  async createAlert(dto: CreateAlertDto) {
    return this.prisma.priceAlert.create({ data: dto });
  }

  async deleteAlert(id: string) {
    await this.prisma.priceAlert.delete({ where: { id } });

    return { success: true };
  }
}
