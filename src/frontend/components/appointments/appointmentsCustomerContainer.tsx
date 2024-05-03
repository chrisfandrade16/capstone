/**
 * Container to actually display appointment card based on id and information
 */

import { useEffect, useState } from "react";
import { Appointment } from "../types";
import { getAppointments } from "../../scripts/appointments";
import AppointmentCard from "./appointmentCard";

interface ApptProps {
    customer: number;
}

const AppointmentsCustomerContainer = (props: ApptProps) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    console.log("AppointmentsCustomerContainer props.customer: " + props.customer)
    useEffect(() => {
        if (!props.customer) return;
        getAppointments({ "filter": "customer", "customer": props.customer }, (result: Appointment[]) => setAppointments(result));
    }, [props.customer]);

    return (
        <div style={{ display: "inline-flex" }}>
            {appointments.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} />
            ))}
        </div>
    );
};
export default AppointmentsCustomerContainer;