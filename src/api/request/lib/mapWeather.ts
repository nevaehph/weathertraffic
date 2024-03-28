//function to return the closest area's weather based on location provided
/*
    1. Find the area in area_metadata with label_location that has the closest distance to location
    2. Once the area has been found, find and return the forecast under weatherData.item by matching its name from the area in area_metadata
*/

//calculate distance between 2 points using Haversine formula: https://www.movable-type.co.uk/scripts/latlong.html
function calculateDistance(
  location1: {
    latitude: number;
    longitude: number;
  },
  location2: {
    latitude: number;
    longitude: number;
  },
): number {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(location2.latitude - location1.longitude);
  var dLon = deg2rad(location2.longitude - location1.longitude);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(location1.latitude)) *
      Math.cos(deg2rad(location2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default (
  location: {
    latitude: number;
    longitude: number;
  },
  weatherData: {
    area_metadata: [
      {
        name: string;
        label_location: {
          latitude: number;
          longitude: number;
        };
      },
    ];
    items: [
      {
        forecasts: [{ area: string; forecast: string }];
      },
    ];
  },
): string => {
  let areaMetadata = weatherData.area_metadata;
  //start with the 1st item
  let closestAreaName = areaMetadata[0].name;
  let closestDistance = calculateDistance(
    location,
    areaMetadata[0].label_location,
  );
  //find closest area from location
  for (var i = 1; i < areaMetadata.length; i++) {
    let distance = calculateDistance(location, areaMetadata[i].label_location);
    if (distance < closestDistance) {
      closestAreaName = areaMetadata[i].name;
      closestDistance = distance;
    }
  }
  return weatherData.items[0].forecasts.find(
    (item: { area: string; forecast: string }) => item.area === closestAreaName,
  ).forecast;
};
