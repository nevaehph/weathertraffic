import { Record } from 'src/db/record/entities/record.entity';
import ParsedRecord from '../dto/parsed-records.dto';

/*
    Function to parse Record Data to be presented for Reports
*/
export default function parseRecordData(records: Record[]): ParsedRecord[] {
  let returnRecords = [];
  for (var i = 0; i < records.length; i++) {
    let locations = [];
    for (var a = 0; a < records[i].data.length; a++) {
      locations.push(records[i].data[a].name);
    }

    returnRecords.push({
      datetime: records[i].datetime,
      locations: locations,
    });
  }
  return returnRecords;
}
