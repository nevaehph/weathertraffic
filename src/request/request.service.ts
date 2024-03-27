import { Injectable } from '@nestjs/common';
import { RequestTrafficWeatherDto } from './dto/request-trafficweather.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import parseGeoCodeLocation from './lib/parseGeocodeInfo';
import mapWeather from './lib/mapWeather';

@Injectable()
export class RequestService {
  constructor(private readonly httpService: HttpService) {}

  async requestTrafficWeather(request: RequestTrafficWeatherDto) {
    //remove milliseconds from date_time if applicable
    request.datetime = request.datetime.split('.')[0];
    //request Traffic Data
    let trafficRequest = firstValueFrom(
      this.httpService
        .get(`${process.env.TRAFFIC_IMAGE_API}?date_time=${request.datetime}`)
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );
    //request weather data
    let weatherRequest = firstValueFrom(
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
    let [trafficResponse, weatherResponse] = await Promise.all([
      trafficRequest,
      weatherRequest,
    ]).catch((error: AxiosError) => {
      throw error;
    });

    //TODO: Catch and handle empty values gracefully

    //reverse geolocate all available cameras using Openmap API
    let cameraLocations = trafficResponse.data.items[0].cameras.map((item) => {
      return firstValueFrom(
        this.httpService
          .get(
            `${process.env.REVERSE_GEO_API}?location=${item.location.latitude},${item.location.longitude}&buffer=10&addressType=All&otherFeatures=N`,
            {
              headers: {
                Authorization: process.env.OPENMAP_KEY,
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );
    });
    let cameraResponses = await Promise.all(cameraLocations).catch(
      (error: AxiosError) => {
        throw error;
      },
    );
    //tag all camera names to their corresponding camera
    for (var i = 0; i < cameraResponses.length; i++) {
      //parse the first geocode location available from Openmap API as the name - Format: camera_id - name
      trafficResponse.data.items[0].cameras[i].name =
        `${trafficResponse.data.items[0].cameras[i].camera_id} - ${parseGeoCodeLocation(
          cameraResponses[i].data.GeocodeInfo[0],
        )}`;
      //map weather to camera
      trafficResponse.data.items[0].cameras[i].weather = mapWeather(
        trafficResponse.data.items[0].cameras[i].location,
        weatherResponse.data,
      );
    }

    //cache data to redis

    return trafficResponse.data.items[0].cameras;
  }
}
