const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Gets a list of all shops in the database
 * @returns a json array of all shops in the database
 */
export const getShops = async () => {
    const response = await fetch(`${API_HOST_URL}/shops`, {
        method: "GET",
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
 * Gets the affiliated shop with a shop owner or employee to populate data on the application accordingly
 * @param userId the shop owner/employee
 * @param onSuccessCallback if the api call is successful
 */
export const getAffliatedShop = (userId: number, onSuccessCallback = (result: any) => { }) => {
    let errorQR = false;
    fetch(API_HOST_URL + `/affiliated/${userId}`, {
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
            } else {
                onSuccessCallback(result);
            }
        });
};

/**
 * Creates a new shop upon registration if the shop owner does not have one already
 * @param shopInfo the information entered by the shop owner
 * @returns An error message if unsuccessful, an empty message otherwise
 */
export const createShop = async (shopInfo: any) => {
    const response = await fetch(`${API_HOST_URL}/shop`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(shopInfo),
    });
    console.log(response);
    if (!response.ok) {
        return {
            error: true,
            message: "Could not establish a connection to the server",
        };
    }
    const result = await response.json();
    console.log(result);
    if (result.failure) {
        return {
            error: true,
            message: Object.keys(result.failure)
                .map((key) => `${key}: ${result.failure[key]}`)
                .join(" "),
        };
    }
    return {
        error: false,
        message: "",
    };
};
