import { Injectable } from '@nestjs/common';
import { RequestTrafficWeatherDto } from './dto/request-trafficweather.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class RequestService {
  constructor(private readonly httpService: HttpService) {}

  async requestTrafficWeather(request: RequestTrafficWeatherDto) {
    //request Traffic Data
    let trafficData = await firstValueFrom(
      this.httpService
        .get(`${process.env.TRAFFIC_IMAGE_API}?date_time=${request.datetime}`)
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );
    let weatherData = await firstValueFrom(
      this.httpService
        .get(
          `${process.env.WEATHER_FORECAST_API}?date_time=${request.datetime}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );
    return {
      trafficData,
      weatherData,
    };
  }
}
