import { IsDateString } from 'class-validator';

export class RequestTrafficWeatherDto {
  @IsDateString()
  datetime: string;
}
