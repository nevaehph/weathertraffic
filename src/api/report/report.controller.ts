import { Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('recent') //Report 5a -  retrieve the most recent 10 date time + location searched by all users consolidated.
  recentReport() {
    return this.reportService.recentReport();
  }
}
