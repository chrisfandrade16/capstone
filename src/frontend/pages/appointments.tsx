/**
 * A NextPage used to display the appropriate appointments page based on which user type is signed in.
 */

import { NextPage } from "next";
import { useAppContext } from "../context/state";
import CustomNavBar from "../components/navigation/navBar";
import AppointmentsCustomerContainer from "../components/appointments/appointmentsCustomerContainer";
import AppointmentsShopContainer from "../components/appointments/appointmentsShopContainer";
import AppointmentsLayout from "../components/appointments/appointmentsLayout";

const Appointments: NextPage = () => {
    const ctx = useAppContext();

    return (
        <>
            <CustomNavBar />
            <AppointmentsLayout>
                {ctx.user?.role ? (
                    <>{ctx.user.role === "customer" ? <AppointmentsCustomerContainer customer={ctx.user.id} /> : <AppointmentsShopContainer />}</>
                ) : (
                    "Loading User Data..."
                )}
            </AppointmentsLayout>
        </>
    );
};

export default Appointments;