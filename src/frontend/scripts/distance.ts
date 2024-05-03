/**
 * Haversine Distance Formula for Geolocation of shop lookup page
 */

// import { GeoLocation } from "../components/types";

const EARTH_RADIUS = 6371; // radius of the earth in km

export const getDistance = (latitude1: number, longitude1: number, latitude2: number, longitude2: number) => {
    const lat1 = latitude1 * Math.PI / 180;
    const lat2 = latitude2 * Math.PI / 180;
    const deltaLat = (latitude2 - latitude1) * Math.PI / 180;
    const deltaLon = (longitude2 - longitude1) * Math.PI / 180;

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(EARTH_RADIUS * c * 100) / 100;
}