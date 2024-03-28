import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from '../../db/record/entities/record.entity';
import { Between, Repository } from 'typeorm';
import parseRecordData from './lib/parseRecordData';
import { ReportTopDto } from './dto/report-top.dto';
import { ReportMostSearchesDto } from './dto/report-most-searches.dto';
import ParsedRecord from './dto/parsed-records.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
  ) {}

  /*
    Report 5a -  retrieve the most recent 10 date time + location searched by all users consolidated.
  */
  async recentReport() {
    let recentRecords = await this.recordRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 10,
    });

    let returnArray = [];

    //refine the return values for each record item
    for (var i = 0; i < recentRecords.length; i++) {
      returnArray.push(parseRecordData(recentRecords[i]));
    }

    return returnArray;
  }

  /*
    Report 5b -  retrieve the top 10 date time + location searched within a period.
  */
  async topReport(query: ReportTopDto) {
    let startDate = new Date(parseInt(query.startTime));
    let endDate = new Date(parseInt(query.endTime));
    let records = await this.recordRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    if (records.length < 1) {
      return [];
    }

    //Map out each record to a hashmap based on its datetime value. Then, from the hashmap, determine the top 10 queries made
    //Insert each record to Hashmap
    let hash = new Map();
    for (var i = 0; i < records.length; i++) {
      let dateTime = records[i].datetime.toISOString();
      if (hash.has(dateTime)) {
        let oldHash = hash.get(dateTime);
        oldHash.count = oldHash.count + 1;
        hash.set(dateTime, oldHash);
      } else
        hash.set(dateTime, {
          record: records[i],
          count: 1,
        });
    }

    //sort by count to determine which datetime has the highest count, ties will be sorted based on which date is later
    let hashSort = new Map(
      [...hash.entries()].sort((a, b) => {
        if (b[1].count !== a[1].count) {
          return b[1].count - a[1].count;
        } else {
          return (
            new Date(b[1].record.datetime).getTime() -
            new Date(a[1].record.datetime).getTime()
          );
        }
      }),
    );

    let array = Array.from(hashSort);
    //keep the first 10 elements of the array
    let topArray = array.slice(0, 10);
    let returnArray = [];

    //parse each record data to be sent as response
    for (var i = 0; i < topArray.length; i++) {
      returnArray.push(parseRecordData(topArray[i][1].record));
    }

    return returnArray;
  }

  /*
    Report 5c - retrieve the period of which there are most searches performed.
  */
  async mostSearchesReport(query: ReportMostSearchesDto) {
    let startDate = new Date(parseInt(query.startTime));
    //add period time to endDate as there might be searches beyond the period that counts towards a particular time
    let periodTime = parseInt(query.period);
    let endDate = new Date(parseInt(query.endTime) + periodTime);
    let records = await this.recordRepository.find({
      order: {
        createdAt: 'ASC',
      },
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    //determine potential targets by trimming off dates that are beyond the period (between start time and end time)
    let targets = [...records];
    while (
      targets[targets.length - 1].createdAt.getTime() >
      new Date(parseInt(query.endTime)).getTime()
    ) {
      targets.pop();
    }

    console.log({ targets });
    console.log({ records });

    //if there are no potential targets, return a response to the client
    if (targets.length < 1) {
      return 'There are no records found within the period specified.';
    }

    //utilize sliding window to determine which target is the best (which has the most searches)
    //setup initial values
    let mostCount = 1;
    let bestTarget = targets[0];
    for (var i = 0; i < targets.length; i++) {
      //each target will check the elements after it to see if their createdAt date is within the time of (createdAt + period), for each element that falls within the time, count + 1
      let count = 1;
      let slidingIndex = i + 1;

      while (
        slidingIndex < records.length &&
        targets[i].createdAt.getTime() + periodTime >=
          records[slidingIndex].createdAt.getTime()
      ) {
        count++;
        slidingIndex++;
      }

      //if final count is higher than the current best target, set current target to be the best target
      if (count > mostCount) {
        mostCount = count;
        bestTarget = targets[i];
      }
    }

    //if counts are similar, it will be defaulted to the earliest best target.
    return bestTarget.createdAt;
  }
}
