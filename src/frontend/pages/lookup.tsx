/**
 * A component used to display the shop lookup page for customers logged into the application.
 */

import { useEffect, useState, useMemo } from "react"
import Head from "next/head"
import { GeoLocation, Shop } from "../components/types"
import { getDistance } from "../scripts/distance"
import CustomNavBar from "../components/navigation/navBar"
import ShopList from "../components/ShopLookup/ShopList"
import SearchBar from "../components/ShopLookup/SearchBar"
import ShopFilter from "../components/ShopLookup/ShopFilter"
import dynamic from "next/dynamic";


const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

const ListMapNoSSR = dynamic(() => import("../components/common/listMap"), { ssr: false });

const createShops = (res: any) => {
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
            latitude: s.latitude,
            longitude: s.longitude
        }
        shops.push(shop);
    })

    return shops;
}

const ShopLookup = () => {
    const getShopUrl = API_HOST_URL + "/shops"

    let [shops, setShops] = useState([] as Shop[]);
    let [query, setQuery] = useState("");
    let [locationQuery, setLocationQuery] = useState({ latitude: 43.257921, longitude: -79.918836 } as GeoLocation);
    let [searchBy, setSearchBy] = useState("1");
    let [sortBy, setSortBy] = useState("1");
    let [filters, setFilters] = useState(new Set<number>());
    let [distance, setDistance] = useState(25);

    useEffect(() => {
        const fetchShops = async () => {
            await fetch(getShopUrl)
                .then(data => { return data.json() })
                .then(res => { setShops(createShops(res)) })
        }

        fetchShops().catch(console.error);

    }, [query, locationQuery, sortBy, filters, distance]);

    const searchQuery = (shop: Shop) => {
        if (query === "") {
            return shop;
        } else if (shop.name.toLowerCase().includes(query.toLowerCase())) {
            return shop;
        }
    };

    const distanceFilter = (shop: Shop) => {
        let shopDist = getDistance(locationQuery.latitude, locationQuery.longitude, shop.latitude, shop.longitude)
        if (isNaN(shopDist)) {
            return shop;
        } else if (shopDist <= distance) {
            return shop;
        }
    };

    const directBookingFilter = (shop: Shop) => {
        //implement
        return shop;
    };

    const serviceFilter = (shop: Shop) => {
        let services = Array.from(filters)
        if (services.length == 0) {
            return shop;
        } else if (services.every(val => Object.values(shop.services).includes(val))) {
            return shop;
        }
    };

    let filtered = useMemo(() => shops.filter(searchQuery).filter(directBookingFilter).filter(distanceFilter).filter(serviceFilter), [shops, query]);

    return (
        <div>
            <CustomNavBar />

            <Head>
                <title>Shop Lookup</title>
            </Head>

            <div style={{ display: "flex", justifyContent: "center" }}>
                <SearchBar
                    setQuery={setQuery}
                    setLocationQuery={setLocationQuery}
                    setSearchBy={setSearchBy}
                    setSortBy={setSortBy}
                    searchBy={searchBy}
                />
            </div>

            <div style={{ fontStyle: "italic", paddingLeft: "1vw" }}>{filtered.length} shops found {query === "" ? "" : `for "${query}"`}</div>


            <div>
                <ListMapNoSSR
                    shops={filtered}
                    center={[locationQuery.latitude, locationQuery.longitude]}
                    radius={distance}
                    style={{ height: "60vh" }}
                />
            </div>

            <div style={{ padding: "1.5vh", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <ShopFilter
                    filters={filters}
                    setFilters={setFilters}
                    distance={distance}
                    setDistance={setDistance}
                />
                <ShopList shops={filtered} locationQuery={locationQuery} sortBy={sortBy} />
            </div>
        </div>
    );
};

export default ShopLookup;