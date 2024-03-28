type DataType = {
  camera_id: string;
  image: string;
  image_metadata: {
    height: number;
    width: number;
    md5: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  name: string;
  timestamp: string;
  weather: string;
}[];

export default DataType;
