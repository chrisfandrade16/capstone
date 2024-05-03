/**
 * This is used to display the availabiity picker on the calendar system for the shops on the application
 */

import React, { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { Availability } from "../../scripts/employee";
import RRuleGenerator from "react-rrule-generator";
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker/dist/entry.nostyle";
import { humanReadableRRule } from "../../components/appointments/rrule";

type AvailabilityPickerProps = {
    availability: Availability,
    handleDelete: Function,
    handleSave: Function,
}

const AvailabilityPicker = (props: AvailabilityPickerProps) => {

    if (props === null) {
        return <div>Not logged in</div>
    }

    const [availability, setAvailability] = useState<Availability | undefined>(props.availability)
    const [startDate, setSelectedStartDay] = useState<string>(new Date().toISOString().substring(0, 10));
    const [rrule, setRrule] = useState<string>("")
    const [startTime, setStartTime] = useState<string>("")
    const [endTime, setEndTime] = useState<string>("")
    const [summary, setSummary] = useState<string>("")

    useEffect(() => {
        if (availability !== undefined) {
            // setAvailability(props)
            // setSelectedStartDay(props.availability.start_date)
            setRrule(props.availability.recurrence)
            setStartTime(props.availability.start_time)
            setEndTime(props.availability.end_time)
            const [s_time, e_time] = [availability.start_time, availability.end_time].map((t: string) => {
                const [h, m] = t.split(":")
                const hour = parseInt(h)
                const min = parseInt(m)
                const ampm = hour >= 12 ? "PM" : "AM"
                const hour12 = hour % 12
                // 2 digit mins and hours
                return `${hour12.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")} ${ampm}`
            })
            const summaryText = `(${s_time} - ${e_time}) - ${humanReadableRRule(availability.recurrence)} starting ${availability.start_date}`
            setSummary(summaryText)
        }
        console.log(availability)
    }, [props])

    const handleChange = (key: string, value: string | Date) => {
        console.log(`Changing ${key}  to ${value}`)
        if (availability !== undefined) {
            if (key === "start_date") {
                let date = value as Date
                setSelectedStartDay(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`)
                console.log(startDate, date)
            }
            if (key.endsWith("_time")) {
                let date = new Date(startDate)
                date.setHours(parseInt(value.split(":")[0]))
                date.setMinutes(parseInt(value.split(":")[1]))
                let time = ""
                if (value != undefined && date != undefined) {
                    time = date.toLocaleTimeString().split(" ")[0]
                }
                if (key === "start_time")
                    setStartTime(time)
                if (key === "end_time")
                    setEndTime(time)
                console.log(time)
            }

            if (key === "recurrence") {
                let rrule = value as string
                console.log(rrule)
                setRrule(rrule)
            }
            setAvailability({ ...availability, [key]: value })
        }
    }

    return (
        <div className="availability">
            <>
                {availability !== undefined ?
                    <div>
                        <Card className="mx-auto">
                            <Card.Body>
                                <Card.Title>Availability</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{availability.id == -1 ? "Set" : "Edit"} your availability</Card.Subtitle>
                                <div className="tw-text-fuchsia-700">{summary}</div>
                                <Button
                                    className="my-0 px-1 py-0"
                                    size="sm"
                                    variant="secondary"
                                    style={{ float: "right" }}
                                    title="Cancel"
                                    onClick={() => {
                                        props.handleDelete(availability.id);
                                    }}
                                >
                                    <i className="fa-solid fa-xmark" />
                                </Button>
                                <Form className="w-20">
                                    <Form.Group className="mb-3" controlId="form">
                                        <Form.Label>Start Date</Form.Label>
                                        <DatePicker
                                            className="p-1"
                                            onChange={(date: Date) => { handleChange("start_date", date) }}
                                            value={startDate}
                                        />
                                        <Form.Label>Start Time</Form.Label>
                                        <TimePicker
                                            className="p-2"
                                            name="start_time"
                                            value={startTime}
                                            onChange={(time: string) => { handleChange("start_time", time) }} />
                                        <Form.Label>End Time</Form.Label>
                                        <TimePicker
                                            name="end_time"
                                            className="p-2"
                                            value={endTime}
                                            onChange={(time: string) => { handleChange("end_time", time) }} />
                                    </Form.Group>
                                    <Form.Group className="mb-3 w-20" controlId="form">
                                        <Form.Label>Recurrence Schedule</Form.Label>
                                        <div className="rrule">
                                            <RRuleGenerator value={rrule} onChange={(rrule: string) => handleChange("recurrence", rrule)} />
                                        </div>
                                    </Form.Group>
                                    <Button variant="primary" title="Save" onClick={() => {
                                        props.handleSave({ ...availability, start_date: startDate, recurrence: rrule, start_time: startTime, end_time: endTime })
                                    }}>Save</Button>
                                </Form>
                            </Card.Body></Card>
                    </div> : <div>loading</div>}
            </>
        </div>

    )
}

export default AvailabilityPicker;