import { Shop } from "../components/types"

/**
 * Create shop list
 * @param res shop information values
 * @returns a list of shops
 */
export const createShops = (res: any) => {
    let shops: Shop[] = []
    res.success.shops.forEach((s: any) => {
        let shop: Shop = {
            id: s.id,
            name: s.name,
            address: s.address,
            description: s.description,
            email: s.email,
            phone: s.phone,
            hours: s.hours,
            owner: s.owner,
            services: s.services,
            employees: s.employees,
            geoLocation: { latitude: 5, longitude: 5 }
        }
        shops.push(shop);
    })

    return shops;
}