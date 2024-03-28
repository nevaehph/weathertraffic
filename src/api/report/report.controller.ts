import { Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';
import { ReportService } from './report.service';
import ParsedRecord from './dto/parsed-records.dto';
import { ReportTopDto } from './dto/report-top.dto';
import { ReportMostSearchesDto } from './dto/report-most-searches.dto';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /*
    Report 5a - retrieve the most recent 10 date time + location searched by all users consolidated.
  */
  @Get('recent')
  recentReport(): Promise<ParsedRecord[]> {
    return this.reportService.recentReport();
  }

  /*
    Report 5b - retrieve the top 10 date time + location searched within a period.
    Query String Parameters:
      - startTime: Period Start Time in milliseconds
      - endTime: Period End Time in milliseconds
  */
  @Get('top')
  topReport(
    @Query(ValidationPipe) query: ReportTopDto,
  ): Promise<ParsedRecord[]> {
    return this.reportService.topReport(query);
  }

  /*
    Report 5c - retrieve the period of which there are most searches performed.
    Query String Parameters:
      - startTime: Period Start Time in milliseconds
      - endTime: Period End Time in milliseconds
      - period: Period to determine the most searches in milliseconds
  */
  @Get('mostSearches')
  mostSearchesReport(
    @Query(ValidationPipe) query: ReportMostSearchesDto,
  ): Promise<Date | string> {
    return this.reportService.mostSearchesReport(query);
  }
}
