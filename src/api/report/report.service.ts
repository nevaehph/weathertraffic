import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from '../../db/record/entities/record.entity';
import { Repository } from 'typeorm';
import parseRecordData from './lib/parseRecordData';

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

    //refine the return values for each record item
    let returnValue = parseRecordData(recentRecords);

    return returnValue;
  }
}
