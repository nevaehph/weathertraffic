import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    HttpModule,
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: 'redis://localhost:6379',
      }),
    }),
  ],
  providers: [RequestService],
  controllers: [RequestController],
})
export class RequestModule {}
