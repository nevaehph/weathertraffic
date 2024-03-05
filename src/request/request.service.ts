import { Injectable } from '@nestjs/common';
import { RequestTrafficWeatherDto } from './dto/request-trafficweather.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import parseGeoCodeLocation from './lib/parseGeocodeInfo';

@Injectable()
export class RequestService {
  constructor(private readonly httpService: HttpService) {}

  async requestTrafficWeather(request: RequestTrafficWeatherDto) {
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
      //parse the first geocode location available from Openmap API
      trafficResponse.data.items[0].cameras[i].name =
        `${trafficResponse.data.items[0].cameras[i].camera_id} - ${parseGeoCodeLocation(
          cameraResponses[i].data.GeocodeInfo[0],
        )}`;
      //TODO: Tag weather data to all cameras
    }
    return {
      trafficData: trafficResponse.data,
      weatherData: weatherResponse.data,
    };
  }
}
