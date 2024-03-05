import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestTrafficWeatherDto } from './dto/request-trafficweather.dto';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post() // For Users to request Traffic and Weather Information
  requestTrafficWeather(
    @Body(ValidationPipe) request: RequestTrafficWeatherDto,
  ) {
    return this.requestService.requestTrafficWeather(request);
  }
}
