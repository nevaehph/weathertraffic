import { IsDateString } from 'class-validator';

//DTO for request parameters, to be ran through validation pipe for validation
export class RequestTrafficWeatherDto {
  @IsDateString()
  datetime: string;
}
