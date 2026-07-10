const GOOGLE_MAPS_API_KEY = 'AIzaSyCABVASK1gEU1Fa0VUGHoGiOQclgVU0buk';

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export const getRoute = async (
  origin: RoutePoint,
  destination: RoutePoint
): Promise<RoutePoint[]> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.routes?.[0]) {
      return [origin, destination];
    }

    const points = decodePolyline(data.routes[0].overview_polyline.points);
    return points;
  } catch {
    return [origin, destination];
  }
};

const decodePolyline = (encoded: string): RoutePoint[] => {
  const points: RoutePoint[] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
};