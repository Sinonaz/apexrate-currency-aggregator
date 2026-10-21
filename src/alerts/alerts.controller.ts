import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getAlerts() {
    return this.alertsService.getAlerts();
  }

  @Post()
  createAlert(@Body() dto: CreateAlertDto) {
    return this.alertsService.createAlert(dto);
  }

  @Delete(':id')
  deleteAlert(@Param('id') id: string) {
    return this.alertsService.deleteAlert(id);
  }
}
