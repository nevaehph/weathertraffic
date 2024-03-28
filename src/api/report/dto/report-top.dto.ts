import { IsNumberString } from 'class-validator';

//DTO for Top Report (5b) Parameters, to be ran through validation pipe for validation
export class ReportTopDto {
  @IsNumberString()
  startTime: string;

  @IsNumberString()
  endTime: string;
}
