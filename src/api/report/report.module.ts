import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from 'src/db/record/entities/record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Record])],
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {}
