import { GeoLocation } from "../components/types"

/**
 * Create geolocation for shop lookup page
 * @param res Latitiude and longitude of location entered
 * @returns a new geolocation based on these coordinates
 */
export const createGeoLocation = (res: any) => {
    let newGeoLocation: GeoLocation = {
        latitude: Number(res[0].lat),
        longitude: Number(res[0].lon)
    }
    return newGeoLocation
}