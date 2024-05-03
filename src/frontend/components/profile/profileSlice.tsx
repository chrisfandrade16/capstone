/**
 * API calls to retrieve various profile information including information, editing information, user vehicle handling
 */

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

export const getUserInfo = async (token: string) => {

    if (!token) {
        return null;
    }

    return await fetch(API_HOST_URL + "/account/me", {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        }
    }).then((httpResponse) => {
        return httpResponse.json()
    }).then((responseJSON) => {
        let output = { ...responseJSON.profile.user, phone: responseJSON.profile.phone, address: responseJSON.profile.address };
        return output;
    })
};

export const changeUserInfo = async (id: int, user, token: string) => {
    return await fetch(API_HOST_URL + `/account/${id}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token}`
        },
        body: JSON.stringify({
            ...user,
        })
    }).then((response) => {
        // console.log(response);
        return response.json()
    }).then((responseJSON) => {
        return responseJSON
    })
};

export const getUserVehicles = async (first_name: string, last_name: string) => {
    let requestQuery = first_name + "," + last_name;
    return await fetch(API_HOST_URL + "/vehicles/owners?search=" + requestQuery, {
        method: "GET",
        headers: {
            Accept: "application/json"
        }
    }).then((response) => {
        // console.log(response);
        return response.json();
    }).then((responseJSON) => {
        return responseJSON;
    })
};

export const getVehicleMakes = async () => {
    return await fetch(API_HOST_URL + "/makes", {
        method: "GET",
        headers: {
            Accept: "application/json"
        }
    }).then((response) => {
        // console.log(response)
        return response.json();
    }).then((responseJSON) => {
        return responseJSON;
    })
};

export const addVehicleToCustomer = async (customer, token, vehicle) => {
    return await fetch(API_HOST_URL + "/vehicle", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token}`
        },
        body: JSON.stringify({
            ...vehicle,
            owner: customer
        })
    }).then((response) => {
        return response.json();
    }).then((responseJSON) => {
        return responseJSON;
    })
};