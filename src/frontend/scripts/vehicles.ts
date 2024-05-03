const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get makes of vehicles stored in the backend database
 * @returns a json array of vehicles from the database (makes, models, years)
 */
export const getMakes = async () => {
    const response = await fetch(`${API_HOST_URL}/makes/`, {
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
 * Get a list of the user's vehicles
 * @param customerEmail the search parameter to narrow down the user vehicles
 * @returns a json array of the user's vehicles if they have any (empty array otherwise)
 */
export const getUserVehicles = async (customerEmail: string) => {
    const link = API_HOST_URL + `/vehicles/owners?search=` + customerEmail;
    const response = await fetch(link, {
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
 * Creates a new vehicle for the user and stores it in the database
 * @param make vehicle make
 * @param model vehicle model
 * @param year vehicle year
 * @param vin vehicle identification number
 * @param plateNumber vehicle license plate number
 * @param owner vehicle owner
 * @param onSuccessCallback if api call is successful
 * @param onFailCallback if api call fails
 */
export const createVehicle = async (
    make: Number,
    model: Number,
    year: number,
    vin: string,
    plateNumber: string,
    owner: Number,
    onSuccessCallback = (result: any) => { },
    onFailCallback = (result: any) => { }
) => {
    let error = false;
    await fetch(API_HOST_URL + "/vehicle", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            make: make,
            model: model,
            year: year,
            vin: vin,
            plate_number: plateNumber,
            owner: owner,
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
            if (error || result.error || result.failure) {
                console.error(result);
                onFailCallback(result);
            } else {
                console.log(result);
                onSuccessCallback(result);
            }
        });
};
