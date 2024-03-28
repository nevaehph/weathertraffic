import { Record } from 'src/db/record/entities/record.entity';
import ParsedRecord from '../dto/parsed-records.dto';

/*
    Function to parse Record Data to be presented for Reports
*/
export default function parseRecordData(record: Record): ParsedRecord {
  let locations = [];
  for (var a = 0; a < record.data.length; a++) {
    locations.push(record.data[a].name);
  }
  return {
    datetime: record.datetime,
    locations: locations,
    createdAt: record.createdAt,
  };
}
