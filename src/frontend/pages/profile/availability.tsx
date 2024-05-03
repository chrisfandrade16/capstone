/**
 * A NextPage used to display employee availability on the shop/shop employee side of the application.
 */

import { NextPage } from "next";
import { useAppContext } from "../../context/state";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

import "react-rrule-generator/build/styles.css"
import { Button, Card, Stack } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";

import { getEmployeeAvailabilities, Availability, deleteEmployeeAvailability, editEmployeeAvailability, addEmployeeAvailability, getShopAvailabilities } from "../../scripts/employee";
import AvailabilityPicker from "../../components/calendar/AvailabilityPicker";
import { Employee } from "../../context/state";


const AvailabilityPage: NextPage = () => {
    const ctx = useAppContext();
    // const DnDCalendar = withDragAndDrop(Calendar);
    if (ctx.user === null) {
        return <div>Not logged in</div>
    }

    const handleAvailabilityDelete = (a: number) => {
        if (a == -1) {
            setAddNew(false)
            return
        }
        deleteEmployeeAvailability({
            ctx, employee_id: 0, id: a, successCallback: (res: any) => {
                getEmployeeAvailabilities({ ctx, employee_id: 0, successCallback: setAvailability })
            }
        })
    };

    const handleAvailabilitySave = (a: Availability) => {
        if (a.id == -1) {
            addEmployeeAvailability({
                ctx, employee_id: 0, availability: a, successCallback: (res: any) => {
                    console.log(res)
                    getEmployeeAvailabilities({ ctx, employee_id: 0, successCallback: setAvailability })
                    setAddNew(false)
                }
            })
        } else {
            editEmployeeAvailability({
                ctx, employee_id: 0, availability: a, successCallback: (res: any) => {
                    console.log(res)
                    getEmployeeAvailabilities({ ctx, employee_id: 0, successCallback: setAvailability })
                }
            })
        }
    };

    const [avails, setAvaills] = useState<any[]>([])

    const create_items = (e: Employee, a: Availability[]) => {
        // const pickers = []
        const pickers = a.map((av: Availability, idx: number) => (
            <AvailabilityPicker key={`picker-${idx}`} availability={av} handleDelete={handleAvailabilityDelete} handleSave={handleAvailabilitySave} />
        ));

        return (
            <Accordion.Item className="tw-outline tw-outline-offset-2 tw-outline-pink-500" eventKey={e.id} variant="dark">
                <div className="tw-text-md tw-m-5">{`${e.first_name} ${e.last_name}"s Availaibilty`}</div>
                <Accordion.Header>
                    Show Availabilities
                </Accordion.Header>
                <Accordion.Body>
                    <Card.Body>
                        {a.length == 0 ? <div className="tw-text-white">No availabilities</div>
                            : pickers
                        }
                    </Card.Body>
                </Accordion.Body>
            </Accordion.Item>
        );
    };

    const [addNew, setAddNew] = useState<boolean>(false);
    const [availability, setAvailability] = useState<Availability[] | undefined>(undefined)

    const availabilityPickers = availability?.map((a: Availability, idx: number) => {
        return <AvailabilityPicker availability={a} handleDelete={handleAvailabilityDelete} handleSave={handleAvailabilitySave} key={`picker-${idx}`} />
    });

    const date = new Date();

    const defaultAvailability: Availability = {
        id: -1,
        employee: ctx.user.id,
        start_date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        start_time: "12:00",
        end_time: "13:00",
        recurrence: "RRULE:FREQ=WEEKLY;INTERVAL=1",
        timezone: "America/New_York",
    };

    useEffect(() => {
        if (ctx.user === null)
            return
        if (ctx?.user?.role === "shopowner") {
            if (ctx.shop === null) {
                getShopAvailabilities(ctx, (res: any) => {
                    res.map((res: any) => {
                        const employee = res["employee"] as Employee
                        const availability = res["availability"] as Availability[]
                        setAvaills([...avails, create_items(employee, availability)])
                    })
                    console.log(res)
                    console.log(avails)
                })
            }
            // <AvailabilityPicker availability={e.availability} handleDelete={handleAvailabilityDelete} handleSave={handleAvailabilitySave} key={`picker-${e.id}`}/>
        }
        if (ctx?.user?.role === "employee")
            getEmployeeAvailabilities({ ctx, employee_id: 0, successCallback: setAvailability })
    }, [ctx.user]);

    return (
        <div className="availability">
            {ctx?.user.role === "employee" ?
                <>
                    <Stack gap={2} className="col-md-7 tw-text-black mx-auto">
                        <Button onClick={() => { setAddNew(!addNew) }}>Add a new Availability</Button>
                        {(availability !== undefined && availability?.length > 0) ? <div></div> : <div>No availabilities</div>}
                        {addNew ? <AvailabilityPicker availability={defaultAvailability} handleDelete={handleAvailabilityDelete} handleSave={handleAvailabilitySave} key={`picker-new`} /> : <div></div>}
                        {availability !== undefined ?
                            availabilityPickers
                            : <div>loading</div>}
                    </Stack>
                </>
                : <></>}
            {ctx?.user.role === "shopowner" ?
                <>
                    <div>Shopowner</div>
                    <Stack gap={2} className="col-md-7 tw-text-black mx-auto">
                        <Accordion>
                            {avails.map((a: any) => { return <>{a}</> })}
                        </Accordion>
                    </Stack>
                </>
                : <></>
            }
        </div>

    );
};

export default AvailabilityPage;
