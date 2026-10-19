import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceSyncModule } from './price-sync/price-sync.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AssetsModule,
    ScheduleModule.forRoot(),
    PriceSyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
