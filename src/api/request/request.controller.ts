import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestTrafficWeatherDto } from './dto/request-trafficweather.dto';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  /*
    For Users to request Traffic and Weather Information
    Body JSON Content
      - datetime: Date & Time to query Traffic and Weather Information
  */
  @Post()
  requestTrafficWeather(
    @Body(ValidationPipe) request: RequestTrafficWeatherDto,
  ) {
    return this.requestService.requestTrafficWeather(request);
  }
}
