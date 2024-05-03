/**
 * Employee API calls
 */

import { AppContextInterface } from "../context/state";

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Employee {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    salary: number;
}

export interface Availability {
    id: number;
    start_date: string;
    start_time: string;
    end_time: string;
    recurrence: string;
    timezone: string;
    employee: number;
}

export interface Reservation {
    id: string;
    //     add_date: Date,
    //   edit_date: Date,
    duration: string,
    // padding,
    time: string,
    // time_secondary,
    state: string,
    schedule: number
}

export interface TimeSpan {
    start: Date;
    end: Date;
}

export interface RequestProps {
    ctx: AppContextInterface,
    successCallback: Function | undefined,
    employee_id: number | undefined
}

export interface RequestAvailabilityProps extends RequestProps {
    availability: Availability
}

export interface RequestDeleteProps extends RequestProps {
    id: number
}

export const getEmployeeAvailabilities = async ({ ctx, successCallback, employee_id }: RequestProps) => {
    const user_id = employee_id ? employee_id : ctx.user?.id;
    fetch(`${API_HOST_URL}/employee/${user_id}/availability`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            // throw new Error(response.statusText);
            console.log(response.statusText)
        }
        return response.json();
    }).then((result: Availability[]) => {
        if (successCallback) successCallback(result);
    });
}

export const getShopAvailabilities = async (ctx: AppContextInterface, successCallback: Function) => {
    fetch(`${API_HOST_URL}/shop/availability/${ctx.user?.id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            // throw new Error(response.statusText);
            console.log(response.statusText)
        }
        return response.json();
    }).then((result: any) => {
        if (successCallback) successCallback(result);
    })
}

export const addEmployeeAvailability = async ({ ctx, availability, successCallback, employee_id }: RequestAvailabilityProps) => {
    const user_id = employee_id ? employee_id : ctx.user?.id;
    fetch(`${API_HOST_URL}/employee/${user_id}/availability`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(availability),
    }).then((response) => {
        if (!response.ok) {
            console.log(response.statusText)
        }
        return response.json();
    }).then((result: Availability) => {
        if (successCallback) successCallback(result);
    });
}

export const deleteEmployeeAvailability = async ({ employee_id, ctx, id }: RequestDeleteProps) => {

    const user_id = employee_id ? employee_id : ctx.user?.id;
    fetch(`${API_HOST_URL}/employee/${user_id}/availability/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            console.log(response.statusText)
        }
        return;
    });
}

export const editEmployeeAvailability = async ({ ctx, availability, successCallback, employee_id }: RequestAvailabilityProps) => {

    const user_id = employee_id ? employee_id : ctx.user?.id;
    fetch(`${API_HOST_URL}/employee/${user_id}/availability/${availability.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(availability),
    }).then((response) => {
        if (!response.ok) {
            console.log(response.statusText)
        }
        return response.json();
    }).then((result: Availability) => {
        if (successCallback) successCallback(result);
    });
}

export const getEmployeeReservations = async (ctx: AppContextInterface, successCallback: any = undefined) => {

    fetch(`${API_HOST_URL}/employee/${ctx.user?.id}/reservations`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            // throw new Error(response.statusText);
            console.log(response.statusText)
        }
        return response.json();
    }).then((result: Reservation[]) => {
        if (successCallback) successCallback(result);
    });
}

export const editEmployeeReservation = async (ctx: AppContextInterface, user_id: number = 0, reservation: Reservation, successCallback: any = undefined) => {

    const employee = user_id ? user_id : ctx.user?.id;
    fetch(`${API_HOST_URL}/employee/${employee}/reservations/${reservation.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reservation),
    }).then((response) => {
        if (!response.ok) {
            console.log(response.statusText)
        }
        return response.json();
    }).then((result: Reservation) => {
        if (successCallback) successCallback(result);
    });
}

export const deleteEmployeeReservation = async (ctx: AppContextInterface, id: string, successCallback: any = undefined) => {

    fetch(`${API_HOST_URL}/employee/${ctx.user?.id}/reservations/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            console.log(response.statusText)
        }
        return;
    });
}

export const getEmployeeSchedule = async (ctx: AppContextInterface, successCallback: any = undefined) => {

    fetch(`${API_HOST_URL}/reserved/${ctx.user?.id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            // throw new Error(response.statusText);
            console.log(response.statusText)
        }
        return response.json();
    }).then((result: any[]) => {
        if (successCallback) successCallback(result);
    });
}

export const getEmployees = async (shop_id: number, successCallback: any = undefined) => {
    fetch(`${API_HOST_URL}/employees/${shop_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            // throw new Error(response.statusText);
            console.log(response.statusText)
        }
        return response.json();
    }).then((result: any) => {
        const employee = result.success.employees as Employee[]
        if (successCallback) successCallback(employee);
    });
}

export const listEmployeeFreeSlots = async (user_id: number, ctx: AppContextInterface, successCallback: any = undefined) => {
    const id = user_id ? user_id : ctx.user?.id;
    console.log(id)
    fetch(`${API_HOST_URL}/availability/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            // throw new Error(response.statusText);
            console.log(response.statusText)
        }
        return response.json();
    }).then((result: any) => {
        if (successCallback) successCallback(result[0]);
    })
}