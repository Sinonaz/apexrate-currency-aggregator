import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceSyncService } from './price-sync/price-sync.service';

@Module({
  imports: [PrismaModule, AssetsModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, PriceSyncService],
})
export class AppModule {}
