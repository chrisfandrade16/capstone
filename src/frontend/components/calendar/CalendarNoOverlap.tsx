/**
 * A component to handle calendar overlap that occurs visually in the calendar feature of the application
 */

import { useState, useCallback, useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Event, Resource } from "../types";
import EventComponent from "./EventComponent";


const localizer = momentLocalizer(moment);

const twify = (a: string) => {
    const res = a.split(" ").map((s) => `tw-${s}`).join(" ")
    return res
}

interface CalendarNoOverlapProps {
    events: Event[];
    resources?: Resource[];
    min?: Date;
    max?: Date;
    handleSelectEvent?: (event: Event) => void;
    pastSelectOnly?: boolean;
    futureSelectOnly?: boolean;
}

const selectFutureOnly = (range: any) => (range.start > moment().valueOf() || range.end > moment().valueOf());
const selectPastOnly = (range: any) => (range.start < moment().valueOf() || range.end < moment().valueOf());

const CalendarNoOverlap = (props: CalendarNoOverlapProps) => {
    const [events, setEvents] = useState<Event[]>(props.events);
    console.log(events)

    const handleSelectEvent = useCallback((event: Event) => {
        // handle select event logic
        if (props.handleSelectEvent) {
            props.handleSelectEvent(event);
        }
    }, []);

    const handleSelectSlot = useCallback(({ start, end, resourceId }: { start: Date; end: Date; resourceId?: number }) => {
        const title = window.prompt("New Event Name");
        if (title) {
            const newEvent = { start, end, title, resourceId };
            setEvents((prevEvents) => [...prevEvents, newEvent]);
        }
    }, []);

    const handleEventResize = useCallback(
        ({ event, start, end }: { event: Event; start: Date; end: Date }) => {
            const updatedEvents = events.map((e) => {
                if (e.title === event.title) {
                    return { ...e, start, end };
                }
                return e;
            });
            setEvents(updatedEvents);
        },
        [events],
    );

    const handleEventDrop = useCallback(
        ({ event, start, end, resourceId }: { event: Event; start: Date; end: Date; resourceId?: number }) => {
            const updatedEvents = events.map((e) => {
                if (e.title === event.title) {
                    return { ...e, start, end, resourceId };
                }
                return e;
            });
            setEvents(updatedEvents);
        },
        [events],
    );

    const handleEventDelete = useCallback((event: Event) => {
        const updatedEvents = events.filter((e) => e.title !== event.title);
        setEvents(updatedEvents);
    }, [events]);

    const resources: Resource[] = useMemo(
        () => props.resources || [],
        [props.resources],
    );

    // Background Colors
    const bg_size = 36
    const diff = (bg_size - 2) + "px"
    const dot_color = "#a799cc"
    const bg_color = "#071421"

    return (
        <div
            className="tw-text-stone-200"
            style={{
                background: `linear-gradient(90deg, ${bg_color} ${diff}, transparent 1%) center, linear-gradient(${bg_color} ${diff}, transparent 1%) center, ${dot_color}`,
                backgroundSize: `${bg_size}px ${bg_size}px`,
                height: "80vh",
            }}
        >
            <Calendar
                localizer={localizer}
                events={events}
                resources={resources.length > 0 ? resources : undefined}
                resourceIdAccessor="resourceId"
                resourceTitleAccessor="title"
                selectable
                popup
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                onDoubleClickEvent={handleSelectEvent}
                onKeyPressEvent={handleSelectEvent}
                onSelecting={(range: any) => {
                    if (props.pastSelectOnly) return selectPastOnly(range);
                    if (props.futureSelectOnly) return selectFutureOnly(range);
                    return true;
                }}
                defaultView={Views.DAY}
                views={[Views.WEEK, Views.DAY, Views.AGENDA, Views.MONTH]}
                step={59}
                showMultiDayTimes
                min={props.min ? props.min : moment({ hours: 7, minutes: 0 }).toDate()}
                max={props.max ? props.max : moment({ hours: 21, minutes: 0 }).toDate()}
                components={{
                    event: EventComponent,
                    agenda: {
                        event: EventComponent,
                    },
                }}
            />
        </div>
    );
};

export default CalendarNoOverlap;