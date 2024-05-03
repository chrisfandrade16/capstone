/**
 * API calls to gather information to display on the homepage when a user is signed in, the number of appointments, quotes, etc.
 */

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

import { getShopQuotes } from "../../scripts/quotes";

export const getUserAppointments = async (userID: Number) => {
    return await fetch(API_HOST_URL + `/appointments/?filter=customer&customer=${userID}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    }).then((out) => {
        return out.json();
    }).then((outJson) => {
        return outJson;
    })
};

const getUserShop = async (userID: Number) => {
    return await fetch(API_HOST_URL + `/affiliated/${userID}`, {
        method: "GET",
        headers: {
            Accept: "application/json"
        }
    }).then((out) => {
        return out.json();
    }).then((outJson) => {
        return outJson.shop.id
    })
};

export const getShopAppointments = async (userID: Number) => {
    let shopID = await getUserShop(userID);
    return await fetch(API_HOST_URL + `/appointments/?filter=shop&shop=${shopID}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    }).then((out) => {
        return out.json();
    }).then((outJson) => {
        return outJson;
    })
};

export const getNumShopAppointments = async (userID: Number) => {
    return await getShopAppointments(userID).then((outJson) => {
        return outJson.length;
    })
};

export const getNumUserAppointments = async (userID: Number) => {
    return await fetch(API_HOST_URL + `/appointments/?filter=customer&customer=${userID}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    }).then((out) => {
        return out.json();
    }).then((outJson) => {
        return outJson.length;
    })
};

export const getNumShopQuotes = async (userID: Number) => {
    let shopID = await getUserShop(userID);
    return await getShopQuotes(shopID).then((res) => {
        return res.length;
    })
};