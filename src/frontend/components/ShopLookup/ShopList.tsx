/**
 * A component to handle the list of shops displayed on the shop lookup page for the customer on the application based on their search parameters.
 */

import React from "react";
import ShopCard from "./ShopCard";
import { GeoLocation, Shop } from "../types";
import ListGroup from "react-bootstrap/ListGroup";
import { getDistance } from "../../scripts/distance";

const ShopList = ({ shops, locationQuery, sortBy }: { shops: Array<Shop>, locationQuery: GeoLocation, sortBy: string }) => {

    const compareDist = (a: Shop, b: Shop) => {
        if (getDistance(locationQuery.latitude, locationQuery.longitude, a.latitude, a.longitude) > getDistance(locationQuery.latitude, locationQuery.longitude, b.latitude, b.longitude)) {
            return 1;
        }
        if (getDistance(locationQuery.latitude, locationQuery.longitude, a.latitude, a.longitude) < getDistance(locationQuery.latitude, locationQuery.longitude, b.latitude, b.longitude)) {
            return -1;
        }
        return 0;
    };

    const compareName = (a: Shop, b: Shop) => {
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        return 0;
    }

    switch (sortBy) {
        case "1":
            shops.sort((a, b) => compareDist(a, b));
            break;
        case "2":
            shops.sort((a, b) => compareName(a, b));
            break;
        case "3":
            shops.sort((a, b) => compareName(b, a));
    }

    return (
        <div style={{ width: "85%", backgroundColor: "transparent" }}>
            <ListGroup>
                {shops.map((shop) => (
                    <ListGroup.Item key={shop.id} style={{ backgroundColor: "transparent" }}>
                        <ShopCard shop={shop} locationQuery={locationQuery} />
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

export default ShopList;