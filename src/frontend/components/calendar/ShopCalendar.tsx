/**
 * The component for the calendar for the shop accounts on the application
 */

import { FC, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import withDragAndDrop, { withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import addHours from "date-fns/addHours";
import startOfHour from "date-fns/startOfHour";

function getRandom(arr: Array<string>, n: number) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
};

type CalendarProps = {
    events: Event[]
};
function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

const ShopCalendar: FC = () => {
    const names = ["John Doe", "Jane Doe", "John Smith", "Jane Smith"]
    const generated_events: Event[] = [];
    for (let i = 0; i < 30; i++) {
        // start at 10am
        let start = new Date()
        const startHour = "2:30pm"
        // start.setTime(startHour * 60 * 60 * 1000) 
        let parts = startHour.replace(/am|pm/, "").split(":")
        let hours = parseInt(parts[0]) + (startHour.indexOf("pm") !== -1 ? 12 : 0);
        let minutes = parseInt(parts[1]) || 0;
        start.setUTCHours(hours, minutes);
        start.setDate(start.getDate() + i)
        let end = addHours(start, 1)
        // 5 events per day, 1 hour long each
        for (let j = 0; j < 10; j++) {
            generated_events.push({
                title: `Booking for ${getRandom(names, 1)[0]} ${i}`,
                start,
                end,
            })
            start = addHours(start, 1)
            end = addHours(end, 1)
        }

    };
    generated_events = getRandomSubarray(generated_events, 100)

    const [events, setEvents] = useState<Event[]>([...generated_events])

    const onEventResize: withDragAndDropProps["onEventResize"] = (data: { start: any; end: any }) => {
        const { start, end } = data

        // setEvents(currentEvents => {
        //   const firstEvent = {
        //     start: new Date(start),
        //     end: new Date(end),
        //   }
        //   return [...currentEvents, firstEvent]
        // })
        setEvents(events.map((event) => {
            return {
                ...event,
                start,
                end,
            } ? event.start === start : event
        }
        ))
    };

    const onEventDrop: withDragAndDropProps["onEventDrop"] = (data: any) => {
        console.log(data)
    };

    return (
        <DnDCalendar
            defaultView="week"
            events={events}
            localizer={localizer}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
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
// Generate random events for testing for upto 1 month

export default ShopCalendar;