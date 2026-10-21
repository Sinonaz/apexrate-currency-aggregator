import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceSyncModule } from './price-sync/price-sync.module';
import { ConfigModule } from '@nestjs/config';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AssetsModule,
    ScheduleModule.forRoot(),
    PriceSyncModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
