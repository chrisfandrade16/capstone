/**
 * A NxtPage used to display the calendar feature of the application on the shop side.
 */

import dynamic from "next/dynamic";
import { NextPage } from "next/types";
// import ShopCalendar from "../../components/calendar/ShopCalendar";
import CustomNavBar from "../../components/navigation/navBar";

const ShopCalendar = dynamic(
    () => import('../../components/calendar/ShopCalendar'),
    { ssr: false }
)

const CalendarPage: NextPage = () => {
    return (
        <div className="calendar">
            <CustomNavBar />
            <h1 className="p-5 mx-5">Shop Calendar</h1>
            <ShopCalendar />
        </div>
    );
};

export default CalendarPage;