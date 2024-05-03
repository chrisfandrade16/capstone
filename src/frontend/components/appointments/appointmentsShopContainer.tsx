/**
 * Shop specific container for appointments on the Appointment page
 */

import { useEffect, useState } from "react";
import { Appointment, AppointmentDetail, Shop } from "../types";
import { getAppointments, getAppointmentsDetail, updateAppointment } from "../../scripts/appointments";
import AppointmentCard from "./appointmentCard";
import AppointmentDetailCard from "./appointmentDetailCard";
import { useAppContext } from "../../context/state";
import { request, AFFLIATED_URL_WITH_ID } from "../../scripts/request";
import NewAppointment from "./newAppointment";
import { useRouter } from "next/router";

const AppointmentsShopContainer: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointmentDetails, setAppointmentDetails] = useState({});
    const [shop, setShop] = useState<Shop | undefined>(undefined);
    const ctx = useAppContext();
    const isPrivileged = (ctx.user?.role === "shopowner" || ctx.user?.role === "employee");
    const router = useRouter();

    useEffect(() => {
        const loadShop = async () => {
            const user_id = ctx.user ? ctx.user.id.toString() : "";
            if (user_id) {
                const shops_result = await request(
                    AFFLIATED_URL_WITH_ID(user_id),
                    null,
                    null
                );
                if (shops_result.success) {
                    const shop = shops_result.success.shop;
                    setShop(shop);
                }
            }
        }
        loadShop()
    }, []);

    useEffect(() => {
        if (shop !== undefined) {
            getAppointments({ "filter": "shop", "shop": shop.id }, (result: Appointment[]) => {
                setAppointments(result)
            })
        }
    }, [shop])

    useEffect(() => {
        // For each appointment, get its appointment detail
        if (appointments.length !== 0) {
            appointments.map((appt) => {
                getAppointmentsDetail(appt.id, (result: AppointmentDetail) => {
                    setAppointmentDetails(prev => ({ ...prev, [appt.id]: result }))
                });
            });
        }
    }, [appointments]);

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
    }
    return (
        <div>
            <h2>Upcoming Appointments</h2>
            <NewAppointment isPrivileged={isPrivileged} shop_id={shop?.id} onSave={router.reload} />
            <div className="appt-details">
                {
                    Array.from(Object.values(appointmentDetails))
                        .filter((appt: any) => (new Date(appt.reservation.time) > new Date()))
                        .map((appt, idx) => <AppointmentDetailCard key={`appt-det-${idx}`} appointment={appt as AppointmentDetail} isPrivileged={true} onSave={handlAppointmentOnSave} onCancel={() => { }} />)
                }
            </div>
            <hr />
            <h2>Past Appointments</h2>
            <div className="appt-brief" style={{ display: "inline-flex" }}>
                {appointments
                    .filter((appt) => new Date(appt.reservation.time) < new Date())
                    .map((appt, idx) => <AppointmentCard key={`appt-${idx}`} appointment={appt} />)}
            </div>
        </div>
    );
};
export default AppointmentsShopContainer;