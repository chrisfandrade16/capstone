/**
 * This allows us to render the component on the client side instead of on the server side.
 */

import { FC, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import addHours from "date-fns/addHours";
import startOfHour from "date-fns/startOfHour";

type CalendarProps = {
    events: Event[]
};

const EmployeeCalendar: FC<CalendarProps> = ({ events }) => {
    const [tempEvents, setTempEvents] = useState<Event[]>([])

    const createTempEvent = (start: Date, end: Date) => {
        const newEvent: Event = {
            id: `${Math.random()}`,
            title: "Temporary Event",
            start,
            end,
            free: false,
        }
        setTempEvents([...tempEvents, newEvent])
    };

    const updateTempEvent = (start: Date, end: Date, id: string) => {
        const updatedEvents = tempEvents.map((event) => {
            return event.id === id
                ? {
                    ...event,
                    start,
                    end,
                }
                : event
        })
        setTempEvents(updatedEvents)
    };

    const removeTempEvent = (id: string) => {
        const updatedEvents = tempEvents.filter((event) => event.id !== id)
        setTempEvents(updatedEvents)
    };

    const onEventResize: withDragAndDropProps["onEventResize"] = (data: { start: any; end: any }) => {
        const { start, end } = data
        updateTempEvent(start, end, data.event.id)
    };

    const onEventDrop: withDragAndDropProps["onEventDrop"] = (data: { start: any; end: any; id: string }) => {
        const { start, end } = data
        updateTempEvent(start, end, data.event.id)
    };

    return (
        // (events !== undefined) ? <div className="text-center">No events</div> :
        <DnDCalendar
            defaultView="week"
            events={[...events, ...tempEvents]}
            localizer={localizer}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            onSelectSlot={(slotInfo) => {
                createTempEvent(slotInfo.start, slotInfo.end)
            }}
            onSelectEvent={(event) => {
                alert(event.title)
                // Open modal to show/edit event
            }}
            eventPropGetter={(event, start, end, isSelected) => {
                let newStyle = {
                    backgroundColor: "indianred",
                    color: "black",
                    borderRadius: "0px",
                    border: "none",
                }

                if (event.free) {
                    newStyle.backgroundColor = "lightgreen"
                }

                return {
                    className: "",
                    style: newStyle,
                }
            }}
            resizable
            style={{ height: "100vh" }}
        />
    );
};

const locales = {
    "en-US": enUS,
};
const endOfHour = (date: Date): Date => addHours(startOfHour(date), 1);
const now = new Date();
const start = endOfHour(now);
const end = addHours(start, 2);

// The types here are `object`. Strongly consider making them better as removing `locales` caused a fatal error
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});
//@ts-ignore
const DnDCalendar = withDragAndDrop(Calendar);

export default EmployeeCalendar;