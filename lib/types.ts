// Data model for Roadbook Family

export interface GpsPoint {
  lat: number;
  lng: number;
}

export interface GeofenceCircle {
  center: GpsPoint;
  radiusMeters: number;
}

export interface RoadbookItem {
  id: string;
  shortName: string;
  longName: string;
  audioUrl?: string;          // optional audio file URL / data URL
  gpsPoint?: GpsPoint;        // optional GPS coordinate
  timeFromPrev?: number;      // seconds from previous point
  timeToNext?: number;        // seconds to next point
  warning?: string;           // optional warning text
  geofence?: GeofenceCircle;  // optional geofence for GPS-based activation
}

export interface RoadbookList {
  id: string;
  name: string;
  lastActivated?: string;     // ISO date string
  items: RoadbookItem[];
}
