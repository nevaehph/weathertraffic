import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '@nestjs-modules/ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from 'src/db/record/entities/record.entity';

@Module({
  imports: [
    HttpModule,
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: 'redis://localhost:6379',
      }),
    }),
    TypeOrmModule.forFeature([Record]),
  ],
  providers: [RequestService],
  controllers: [RequestController],
})
export class RequestModule {}
