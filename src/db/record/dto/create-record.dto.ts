import { IsDate, IsNotEmpty } from 'class-validator';

import DataType from './data-type.dto';

export class CreateRecordDto {
  //JSON Data of request
  @IsNotEmpty()
  data: DataType;

  //Date Time Parameter of request
  @IsDate()
  @IsNotEmpty()
  datetime: Date;
}
