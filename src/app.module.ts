import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
// API Modules
import { RequestModule } from './api/request/request.module';
import { ReportModule } from './api/report/report.module';
//DB Entity Modules
import { RecordModule } from './db/record/record.module';
import { Record } from './db/record/entities/record.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'weathertraffic',
      password: 'weathertraffic12345',
      database: 'weathertraffic_db',
      entities: [Record],
      synchronize: true,
    }),
    ConfigModule.forRoot(),
    RequestModule,
    ReportModule,
    RecordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
