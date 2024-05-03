/**
 * API calls used for the appointments feature of the application.
 */

import { Appointment, AppointmentDetail } from "../components/types";

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAppointments = (query: any = {}, successCallback: any = undefined, failCallback: any = undefined) => {
    let error = false;
    let url = API_HOST_URL + "/appointments";
    if (Object.keys(query).length > 0) {
        url += "?" + new URLSearchParams(query).toString();
    }
    fetch(url, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            if (error) {
                console.error(result);
                if (failCallback) failCallback(result);
            } else {
                const appointments = result.map((appt: Appointment) => appt);
                if (successCallback) successCallback(appointments);
            }
        });
};

export const addAppointment = (data: AppointmentDetail, successCallback: any = undefined, failCallback: any = undefined) => {
    let error = false;
    fetch(API_HOST_URL + "/appointments/", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            if (error) {
                console.error(result);
                if (failCallback) failCallback(result);
            } else {
                const appointment = result as Appointment;
                if (successCallback) successCallback(appointment);
            }
        });
};

export const updateAppointment = (data: AppointmentDetail, successCallback: any = undefined, failCallback: any = undefined) => {
    let error = false;
    fetch(API_HOST_URL + `/appointments/${data.id}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            if (error) {
                console.error(result);
                if (failCallback) failCallback(result);
            } else {
                const appointment = result as Appointment;
                if (successCallback) successCallback(appointment);
            }
        });
};

export const deleteAppointment = (id: number, successCallback: any = undefined, failCallback: any = undefined) => {
    let error = false;
    fetch(API_HOST_URL + `/appointments/${id}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    }).then((response) => {
        if (!response.ok) {
            error = true;
        }
        return error;
    })
}

export const getAppointmentsDetail = (id: number, successCallback: any = undefined, failCallback: any = undefined) => {
    let error = false;
    fetch(API_HOST_URL + `/appointments/${id}`, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            if (error) {
                console.error(result);
                if (failCallback) failCallback(result);
            } else {
                const appointment = result as AppointmentDetail;
                if (successCallback) successCallback(appointment);
            }
        });
}