/**
 * A NextPage used to display the calendar feature on the shop side of the application.
 */

import dynamic from "next/dynamic";
import { NextPage } from "next/types";
import CustomNavBar from "../../components/navigation/navBar";
import { listEmployeeFreeSlots } from "../../scripts/employee";
import { getEmployeeSchedule } from "../../scripts/employee";

// We can import the EmployeeCalendar component from the next/dynamic package.
// This allows us to render the component on the client side instead of on the server side.
// const EmployeeCalendar = dynamic(
//     () => import("../../components/calendar/EmployeeCalendar"),
//     { ssr: false }
// ) as typeof EmployeeCalendar
// import EmployeeCalendar from "../../components/calendar/EmployeeCalendar";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/state";
import { Event } from "../../components/types";

// import CalendarNoOverlap from "../../components/calendar/CalendarNoOverlap";

const CalendarNoOverlapNoSSR = dynamic(
    () => import("../../components/calendar/CalendarNoOverlap"),
    { ssr: false }
)

const CalendarPage: NextPage = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const ctx = useAppContext()

    useEffect(() => {
        if (ctx.user != null) {
            listEmployeeFreeSlots(ctx.user.id, ctx, (fs: any) => {
                const free_list = fs.free_slots.map((t: any) => {
                    return {
                        start: new Date(t[0]),
                        end: new Date(t[1]),
                        title: "Free Slot",
                        resourceId: fs.employee
                    }
                });

                getEmployeeSchedule(ctx, (es: any) => {
                    const booked = es.map((t: any) => {
                        return {
                            start: new Date(t.start),
                            end: new Date(t.end),
                            title: t.title,
                            resourceId: t.employee,
                        }
                    });

                    const evts = {};
                    [...free_list, ...booked].forEach(event => {
                        const key = `${event.title}-${event.start.getTime()}`;
                        if (!evts[key]) {
                            evts[key] = event;
                        }
                    });

                    setEvents(Object.values(evts));
                });
            });
        }
    }, [ctx.user]);

    return (
        <div className="calendar">
            <CustomNavBar />
            <h1 className="p-5 mx-5">Employee Calendar</h1>
            {/* <EmployeeCalendar events={[]}/> */}
            {
                events.length > 0 ? (
                    <CalendarNoOverlapNoSSR resources={[]} events={events} futureSelectOnly={true} />
                ) : (<h1>Loading...</h1>)
            }
        </div>
    );
};

export default CalendarPage;