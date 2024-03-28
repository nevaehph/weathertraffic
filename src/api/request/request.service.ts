import { Injectable } from '@nestjs/common';
import { RequestTrafficWeatherDto } from './dto/request-trafficweather.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import parseGeoCodeLocation from './lib/parseGeocodeInfo';
import mapWeather from './lib/mapWeather';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from '../../db/record/entities/record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RequestService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRedis() private readonly redis: Redis,
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
  ) {}

  //Request for Users to request Traffic and Weather Information
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

    let responseData;

    //general function used to fallback if an API request fails
    async function loadBackup(that) {
      //check if data is available in cache
      let value = await that.redis.get(request.datetime);
      if (value) {
        //if cache value is available, set responseData as cache value
        return JSON.parse(value);
      } else {
        return null;
      }
    }

    let promiseResponse = await Promise.all([
      trafficRequest,
      weatherRequest,
    ]).catch(async (error: AxiosError) => {
      //if error is caught, attempt to fallback to cache
      responseData = await loadBackup(this);
      if (!responseData) {
        throw error;
      }
    });

    if (!responseData) {
      //reverse geolocate all available cameras using Openmap API
      let trafficResponse = promiseResponse[0];
      let weatherResponse = promiseResponse[1];
      let cameraLocations = trafficResponse.data.items[0].cameras.map(
        (item) => {
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
        },
      );

      if (!responseData) {
        let cameraResponses = await Promise.all(cameraLocations).catch(
          async (error: AxiosError) => {
            //if error is caught, attempt to fallback to cache
            responseData = await loadBackup(this);
            if (!responseData) {
              throw error;
            }
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
        let cacheKey = request.datetime.toString();
        let cacheValue = JSON.stringify(trafficResponse.data.items[0].cameras);
        await this.redis.set(cacheKey, cacheValue);

        responseData = trafficResponse.data.items[0].cameras;
      }
    }

    //store record as data
    const record: Record = new Record();
    record.data = [...responseData];
    //set datetime to not include timezone
    let datetime = new Date(request.datetime);
    let offset = datetime.getTimezoneOffset() * 60000;
    record.datetime = new Date(datetime.getTime() - offset);

    this.recordRepository.save(record);

    return responseData;
  }

  //Request for webpage to get recommended date times (Gets 3 latest Date Times requested overall)
  async requestRecommendations() {
    let records = await this.recordRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 3,
    });
    let returnArray = [];
    for (var i = 0; i < records.length; i++) {
      returnArray.push(records[i].datetime);
    }

    return returnArray;
  }
}
