import { GeocodeDto } from '../dto/geocode.dto';

//function to parse Reverse Geocode Information from OpenMap to a readable name
export default (data: GeocodeDto): string => {
  let buildingName = `${data.BUILDINGNAME != 'NIL' ? `${data.BUILDINGNAME} ` : ''}`;
  let block = `${data.BLOCK != 'NIL' ? `BLK ${data.BLOCK} ` : ''}`;
  let road = `${data.ROAD != 'NIL' ? `${data.ROAD} ` : ''}`;
  let postalcode = `${data.POSTALCODE != 'NIL' ? `Singapore ${data.POSTALCODE}` : ''}`;
  //remove whitespaces on both ends before returning
  return `${buildingName}${block}${road}${postalcode}`;
};
