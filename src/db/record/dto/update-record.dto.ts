import { PartialType } from '@nestjs/mapped-types';
import { CreateRecordDto } from './create-record.dto';
import { IsDate, IsNotEmpty } from 'class-validator';

import DataType from '../lib/DataType';

export class UpdateRecordDto extends PartialType(CreateRecordDto) {
  //JSON Data of request
  @IsNotEmpty()
  data: DataType;

  //Date Time Parameter of request
  @IsDate()
  @IsNotEmpty()
  datetime: Date;
}
