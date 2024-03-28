import { IsDate, IsNotEmpty } from 'class-validator';

import DataType from '../lib/DataType';

export class CreateRecordDto {
  //JSON Data of request
  @IsNotEmpty()
  data: DataType;

  //Date Time Parameter of request
  @IsDate()
  @IsNotEmpty()
  datetime: Date;
}
