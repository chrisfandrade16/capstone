/**
 * A page used to display an individual appointment on either the customer or shop side of the application.
 */

import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useAppContext } from "../../context/state";
import CustomNavBar from "../../components/navigation/navBar";
import AppointmentDetailCard from "../../components/appointments/appointmentDetailCard";
import { getAppointmentsDetail, updateAppointment } from "../../scripts/appointments";
import { AppointmentDetail, Appointment } from "../../components/types";

const AppointmentsDetail: NextPage = () => {
    const priviledgedUsrs = ["shopowner", "employee"]
    const router = useRouter();
    const { appointmentId } = router.query;
    const ctx = useAppContext();
    const [appointment, setAppointment] = useState({} as AppointmentDetail);
    
    useEffect(() => {
        if (appointmentId === undefined) return;
        getAppointmentsDetail(Number(appointmentId), (res: AppointmentDetail) => {
            setAppointment(res)
            console.log(res)
        },
            (err: Error) => { console.log(err) })
    }, [appointmentId]);

    const handlAppointmentOnSave = (appt: AppointmentDetail) => {
        const data_appt = { ...appt, quote: { quote_request: { shop: appt.shop.id } } };
        delete data_appt.quote.comments;
        updateAppointment(data_appt,
            (result: Appointment) => {
                console.log("Appointment updated")
            },
            (error: any) => {
                console.log(error)
                console.log("Error updating appointment")
            })
    };

    return (
        <>
            <CustomNavBar />
            <AppointmentDetailCard appointment={appointment} isPrivileged={priviledgedUsrs.includes(ctx.user?.role) || false} onSave={handlAppointmentOnSave} onCancel={() => { }} />
        </>
    );
};

export default AppointmentsDetail;