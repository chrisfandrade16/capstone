import { QuoteRequest } from "../components/types";
import { QuoteService } from "./common";

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Gets a list of all quotes associated with a shop
 * @param shopID the shopID affiliated with the user signed in
 * @returns a json aray of quotes
 */
export const getShopQuotes = async (shopID: Number) => {
    const response = await fetch(API_HOST_URL + `/quotes?shop=${shopID}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    });
    console.log(response);
    const result = await response.json();
    console.log(result);
    return result;
};

/**
 * Gets a list of all services associated with a shop
 * @param shopID the shopID affiliated with the user signed in
 * @returns a json array of all of a shop's services
 */
export const getShopServices = async (shopID: Number) => {
    const response = await fetch(API_HOST_URL + `/shop/${shopID}/services`, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    console.log(response);
    const result = await response.json();
    console.log(result);
    return result;
};

/**
 * Get services to be listed in a quote
 * @param quoteId associated quote id
 * @param onSuccessCallback if api call is successful
 */
export const getQuoteServices = (quoteId: number, onSuccessCallback = (result: any) => { }) => {
    let errorQR = false;
    fetch(API_HOST_URL + `/quote/${quoteId}/service`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                errorQR = true;
                console.error(response);
            }
            return response.json();
        })
        .then((result) => {
            if (errorQR) {
                console.error(result);
            } else {
                onSuccessCallback(result);
            }
        });
};

/**
 * Upload images to a quote request
 * @param quoteRequest associated quote request we want images on
 * @param upload_data the images uploaded by the user
 * @returns result of the image upload (error/no error)
 */
export const uploadImages = (quoteRequest: QuoteRequest, upload_data: FormData) => {
    let error = false;
    return fetch(API_HOST_URL + `/quote/request/${Number(quoteRequest.id)}/image`, {
        method: "POST",
        headers: {
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
        body: upload_data,
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
                console.log("error");
            }
            console.log(response);
            return response.json;
        })
        .then((result) => {
            if (error) {
                console.error(result);
            }
            console.log(result);
            return result;
        });
};

/**
 * Create a shop quote once a customer quote request has been created
 * @param quoteRequest associated quote request that has been created
 * @param selectedShopList shops that have been selected by the customer; a quote will be created for each one
 * @returns result of the quote creations
 */
export const createShopQuote = async (quoteRequest: QuoteRequest, selectedShopList: Number[]) => {
    return Promise.all(
        selectedShopList.map((shopId) => {
            return fetch(API_HOST_URL + "/quote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({
                    shop: shopId,
                    quote_request: quoteRequest.id,
                    status: "pending",
                    services: [],
                }),
            })
                .then((response) => {
                    if (!response.ok) {
                        console.log("error");
                    }
                    console.log(response);
                    return response.json();
                })
                .then((result) => {
                    console.log(result);
                    return result;
                });
        })
    );
};

/**
 * Create a new service from a quote
 * @param quoteId associated quote id
 * @param service service to be added from quote
 * @returns result of service creation (error/no error)
 */
export const createQuoteService = (quoteId: number, service: QuoteService) => {
    let errorQR = false;
    return fetch(API_HOST_URL + `/quote/${quoteId}/service`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...service, quote: quoteId }),
    })
        .then((response) => {
            if (!response.ok) {
                errorQR = true;
                console.error(response);
            }
            return response.json();
        })
        .then((result) => {
            if (errorQR) {
                console.error(result);
            }
            return result;
        });
};

/**
 * Edit a service from a quote
 * @param quoteId quote we are modfying the service on
 * @param service ID of the service that is being modified
 * @returns the result of editing (error/ no error)
 */
export const editQuoteService = (quoteId: number, service: QuoteService) => {
    let errorQR = false;
    return fetch(API_HOST_URL + `/quote/${quoteId}/service?id=${service.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...service }),
    })
        .then((response) => {
            if (!response.ok) {
                errorQR = true;
                console.error(response);
            }
            return response.json();
        })
        .then((result) => {
            if (errorQR) {
                console.error(result);
            }
            return result;
        });
};

/**
 * Delete a quote service on the quote modify section
 * @param quoteId quote we are using to delete service
 * @param serviceId ID of the service we are deleting
 * @returns the result of deletion (error/no error)
 */
export const deleteQuoteService = (quoteId: number, serviceId: Number) => {
    let errorQR = false;
    return fetch(API_HOST_URL + `/quote/${quoteId}/service?id=${serviceId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                errorQR = true;
                console.error(response);
            }
            return response.json();
        })
        .then((result) => {
            if (errorQR) {
                console.error(result);
            }
            return result;
        });
};

/**
 * Get quote
 * @param quoteId quote we are retrieving
 * @param onSuccessCallback if api call is successful
 * @returns the specified quote we are looking for
 */
export const getQuote = (quoteId: number, onSuccessCallback = (result: any) => { }) => {
    let errorQR = false;
    return fetch(API_HOST_URL + `/quote/${quoteId}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                errorQR = true;
                console.error(response);
            }
            return response.json();
        })
        .then((result) => {
            if (errorQR) {
                console.error(result);
            } else {
                onSuccessCallback(result);
                return result;
            }
        });
};

/**
 * Send quote notice
 * @param quoteId associated quote
 * @param onSuccessCallback if api call is successful
 */
export const sendQuoteNotice = (quoteId: number, onSuccessCallback = (result: any) => { }) => {
    let errorQR = false;
    fetch(API_HOST_URL + `/quote/${quoteId}`, {
        method: "POST",
        headers: {
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                errorQR = true;
                console.error(response);
            }
            return response.json();
        })
        .then((result) => {
            if (errorQR) {
                console.error(result);
            } else {
                onSuccessCallback(result);
            }
        });
};

/**
 * Update a quote on the shop side of the application
 * @param quoteId quote that is being updated
 * @param fields fields that are being modified
 * @param onSuccessCallback if the api call is successful
 */
export const updateQuote = (quoteId: number, fields: Object, onSuccessCallback = (result: any) => { }) => {
    let errorQR = false;
    fetch(API_HOST_URL + `/quote/${quoteId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(fields),
    })
        .then((response) => {
            if (!response.ok) {
                errorQR = true;
                console.error(response);
            }
            return response.json();
        })
        .then((result) => {
            if (errorQR) {
                console.error(result);
            } else {
                onSuccessCallback(result);
            }
        });
};

// Customer quote functions ============================================================

/**
 * Gets a list of all of a user's quote requests
 * @param customerId customer ID to filter by for quote requests
 * @param onSuccessCallback if api call is successful
 */
export const getUserQuoteRequests = (customerId: number, onSuccessCallback = (result: any) => { }) => {
    let errorQR = false;
    fetch(API_HOST_URL + "/quote/requests/?customer=" + customerId, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                errorQR = true;
                console.error(response);
            }
            return response.json();
        })
        .then((result) => {
            if (errorQR) {
                console.error(result);
            } else {
                onSuccessCallback(result);
            }
        });
};

/**
 * Create a quote request based on customer entered fields
 * @param user customer information
 * @param description description of what is wrong with vehicle
 * @param partPreference part preference for issue
 * @param userVehicle customer vehicle
 * @param availability availability of the customer
 * @param upload_data photo uploads if there are any
 * @param selectedShopList selected shops from the shop lookup page
 * @param onSuccessCallback if api call is successful
 * @param onFailCallback if api call fails
 */
export const createQuoteRequest = (
    user: Number,
    description: string,
    partPreference: string,
    userVehicle: Number,
    availability: string,
    upload_data: FormData,
    selectedShopList: [],
    onSuccessCallback: (result: any) => {},
    onFailCallback: (result: any) => {}
) => {
    let error = false;
    fetch(API_HOST_URL + "/quote/request/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            customer: Number(user),
            description: description,
            part_preference: partPreference,
            vehicle: userVehicle,
            availability: availability,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
                console.log("error");
            }
            console.log(response);
            return response.json();
        })
        .then((result) => {
            console.log("QUOTE REQUEST RESULT");
            console.log(result);
            if (error || result.error || result.failure) {
                onFailCallback(result);
            } else {
                Promise.all([uploadImages(result.quoteRequest, upload_data), createShopQuote(result.quoteRequest, selectedShopList)]).then(
                    (results) => {
                        console.log(results);
                        onSuccessCallback(results);
                    }
                );
            }
        });
};

/**
 * Formats the file size of an image uploaded to a quote request
 * @param size size of the file
 * @returns a formatted file size to ensure files are not too large
 */
export const formatFileSize = (size: number) => {
    if (size < 1000000) {
        return (size / 1024).toFixed(2) + " KB";
    } else {
        return (size / 1048576).toFixed(2) + " MB";
    }
};

/**
 * Searches through the shops in the database based on the user-entered parameters
 * @param address address to search as a starting point
 * @param km maximum distance away from shop
 * @param onSuccessCallback if api call is successful
 * @param onFailCallback if api call fails
 * @returns search results of shops based on the user-entered parameters address and km
 */
export const searchShops = (address: string, km: string, onSuccessCallback = (result: any) => { }, onFailCallback = (result: any) => { }) => {
    let errorQR = false;
    return fetch(
        API_HOST_URL +
        `/shops/search?${new URLSearchParams({
            addr: address,
            dist: km,
        })}`
    )
        .then((response) => {
            if (!response.ok) {
                errorQR = true;
                console.error(response);
            }
            return response.json();
        })
        .then((result) => {
            if (errorQR) {
                console.error(result);
                onFailCallback(result);
            } else onSuccessCallback(result);
        });
};

/**
 * Gets a specific quote request
 * @param reqId the associated quote request id
 * @param onSuccessCallback if api call is successful
 * @returns associated quote request with the reqID
 */
export const getQuoteRequest = (reqId: number, onSuccessCallback = (result: any) => { }) => {
    let errorQR = false;
    return fetch(API_HOST_URL + `/quote/request/${reqId}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                errorQR = true;
                console.log("error");
            }
            return response.json();
        })
        .then((result) => {
            if (errorQR) {
                console.error(result);
            } else onSuccessCallback(result);
        });
};
