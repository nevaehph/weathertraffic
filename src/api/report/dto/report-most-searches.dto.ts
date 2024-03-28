import { IsNumberString } from 'class-validator';

//DTO for Most Searches (5c) Parameters, to be ran through validation pipe for validation
export class ReportMostSearchesDto {
  @IsNumberString()
  startTime: string;

  @IsNumberString()
  endTime: string;

  @IsNumberString()
  period: string;
}
