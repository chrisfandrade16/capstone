/**
 * Functional component for creating a new appointment on the Appointments page
 */

import React, { useState, useEffect } from "react";
import { Reservation, Quote, Shop, Appointment } from "../types";
import { Button, InputGroup, Form, Modal } from "react-bootstrap";
import { Employee, getEmployees } from "../../scripts/employee";
import { addAppointment } from "../../scripts/appointments";
import { request, AFFLIATED_URL_WITH_ID, SHOP_URL_WITH_ID, WORKORDER_URL, METHOD_TYPES } from "../../scripts/request";
import { useAppContext } from "../../context/state";

interface NewAppointmentProps {
    isPrivileged: boolean;
    shop_id: number | undefined;
    quote_id?: number;
    onSave?: Function;
}


const NewAppointment: React.FC<NewAppointmentProps> = ({ isPrivileged, shop_id, quote_id, onSave }) => {
    const ctx = useAppContext();
    const [shopEmployees, setShopEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);
    const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>(undefined);
    const now = (new Date()).toISOString()
    const [reservation, setReservation] = useState<Reservation>({
        time: now,
        duration: "00:30:00",
        schedule: 0,
    });
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [time_estimate, setTimeEstimate] = useState<number>(0);
    const [message, setMessage] = useState<string>("");
    const [price_estimate, setPriceEstimate] = useState<number>(0);
    const [variant, setVariant] = useState<string>("primary");
    const [show, setShow] = useState(false);
    const [shop, setShop] = useState<Shop>();
    const [quoteList, setQuoteList] = useState<Quote[]>([]);
    const [quote, setQuote] = useState<string>();
    const [customer, setCustomer] = useState<number>();
    // console.log("page shopid", shop);
    // console.log("quote", quote);



    useEffect(() => {
        // if (!isPrivileged){
        //   return
        // }
        const loadQuotes = async () => {
            console.log("Loading quotes")
            if (quote_id === undefined) {
                const quote_result = await request(
                    `/quotes?shop=${shop_id}`,
                    null,
                    null,
                    ctx
                );
                if (quote_result.success) {
                    const quotes = quote_result.success.data as Quote[];
                    setQuoteList(quotes);
                } else {
                    console.log("error", quote_result)
                }
            }
        }

        const loadShop = async () => {
            if (shop_id) {
                const shops_result = await request(
                    SHOP_URL_WITH_ID(shop_id.toString()),
                    null,
                    null
                );
                if (shops_result.success) {
                    loadQuotes()
                    setShop(shops_result.success.shop);
                } else {
                    console.log("error", shops_result)
                }
            }
            const user_id = ctx.user ? ctx.user.id.toString() : "";
            if (user_id) {
                const shops_result = await request(
                    AFFLIATED_URL_WITH_ID(user_id),
                    null,
                    null
                );
                if (shops_result.success) {
                    loadQuotes()
                    setShop(shops_result.success.shop);
                }
            }
        }
        if (shop_id !== undefined) {
            loadShop()
        }
    }, [shop_id, quote_id])


    useEffect(() => {
        if (isPrivileged && shop_id !== undefined) {
            getEmployees(shop_id, (employees: Employee[]) => {
                setShopEmployees(employees);
                console.log(employees)
            });
        }
    }, [shop]);

    const handleQuoteSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedQuote = quoteList.find((quote) => quote.id.toString() === event.target.value) as Quote;
        console.log(selectedQuote)
        if (selectedQuote) {
            setSelectedQuote(selectedQuote);
            setCustomer(selectedQuote.quote_request.customer.id);
            setQuote(selectedQuote.id.toString());
            // setPriceEstimate(selectedQuote.price_estimate);
            // setTitle(selectedQuote.quote_request.title);
            setDescription(selectedQuote.quote_request.description);
            // setTimeEstimate(selectedQuote.time_estimate);
        } else {
            setSelectedQuote(undefined);
        }
    };

    const handleEmployeeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedEmployee = shopEmployees.find((employee) => employee.username === event.target.value);
        if (selectedEmployee) {
            setSelectedEmployee(selectedEmployee);
            setReservation(prevReservation => ({
                ...prevReservation,
                schedule: selectedEmployee.id
            }));
        } else {
            setSelectedEmployee(undefined);
        }
    };

    const handleReservationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setReservation(prevReservation => ({
            ...prevReservation,
            [name]: value
        }));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        switch (name) {
            case "title":
                setTitle(value);
                break;
            case "description":
                setDescription(value);
                break;
            case "time_estimate":
                setTimeEstimate(Number(value));
                break;
            case "message":
                setMessage(value);
                break;
            case "price_estimate":
                setPriceEstimate(Number(value));
                break;
            default:
                break;
        }
    };

    const handleSave = () => {
        if (!selectedEmployee) {
            return;
        }
        const newAppointment: Appointment = {
            title,
            description,
            reservation,
            time_estimate,
            message,
            customer,
            quote: quote_id ? quote_id : quote,
            shop: shop_id ? shop_id : shop?.id,
            price_estimate,
        };
        setVariant("success");
        // Send POST request to create new appointment
        addAppointment(newAppointment, (res: any) => {
            setVariant("success");
            if (onSave)
                onSave()
            console.log(res)
            request(WORKORDER_URL, METHOD_TYPES.CREATE, {
                appointments: res.id,
                services: selectedQuote.services,
                status: "pending",
                work_description: "",
                note: "",
            });
        });
        setShow(false);
    };

    return (
        <>
            <Button variant="primary" onClick={() => setShow(true)} style={{ marginTop: "-2rem", float: "right" }}>
                <i className="fa-solid fa-plus" />
            </Button>
            <Modal className="tw-text-black" show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>New Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {quoteList?.length > 0 && (
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Quote:</InputGroup.Text>
                            <Form.Select
                                value={selectedQuote?.id}
                                onChange={handleQuoteSelect}
                                name="quote_id"
                                className="form-control">
                                <option value="">Select a quote</option>
                                {quoteList.map((quote) => {
                                    return (
                                    <option key={quote.id} value={quote.id}>
                                        {`${quote.quote_request.customer?.first_name} ${quote.quote_request.customer?.last_name} - ${quote.quote_request.description}`}
                                    </option>
                                )})}
                            </Form.Select>
                        </InputGroup>
                    )}
                    {/* {quote && (
          <InputGroup className="mb-3">
            <InputGroup.Text>Quote:</InputGroup.Text>
            <Form.Select
              name="quote_id"
              value={quote?.id}
              className="form-control">
              <option value="">Select a quote</option>
              <option key={quote.id} value={quote.id}>
                {`${quote.quote_request.customer.first_name} ${quote.quote_request.customer.last_name} - ${quote.quote_request.description}`}
              </option>
            </Form.Select>
          </InputGroup>
        )} */}
                    <InputGroup className="mb-3">
                        <InputGroup.Text>Title:</InputGroup.Text>
                        <input type="text" name="title" value={title} onChange={handleInputChange} className="form-control" />
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>Description:</InputGroup.Text>
                        <textarea name="description" value={description} onChange={handleInputChange} className="form-control" />
                    </InputGroup>
                    {isPrivileged && (
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Employee:</InputGroup.Text>
                            {shopEmployees && shopEmployees.length > 0 ? (
                                <Form.Select
                                    name="employee_id"
                                    value={selectedEmployee?.username}
                                    onChange={handleEmployeeSelect}
                                    className="form-control">
                                    <option value="">Select an employee</option>
                                    {shopEmployees.map((employee) => (
                                        <option key={employee.id} value={employee.username}>
                                            {`${employee.first_name} ${employee.last_name}`}
                                        </option>
                                    ))}
                                </Form.Select>
                            ) : (shopEmployees.length === 0 ? <p>No employees found</p> : <p>Loading employees</p>)}
                        </InputGroup>
                    )}
                    <InputGroup className="mb-3">
                        <InputGroup.Text>Date:</InputGroup.Text>
                        <input type="datetime-local" name="time" value={reservation.time} onChange={handleReservationChange} className="form-control" />
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>Duration:</InputGroup.Text>
                        <input type="duration" name="duration" value={reservation.duration} onChange={handleReservationChange} className="form-control" />
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>Time Estimate:</InputGroup.Text>
                        <input type="number" name="time_estimate" value={time_estimate} onChange={handleInputChange} className="form-control" />
                        <InputGroup.Text>hours</InputGroup.Text>
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>Message:</InputGroup.Text>
                        <textarea name="message" value={message} onChange={handleInputChange} className="form-control" />
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>Price Estimate:</InputGroup.Text>
                        <input type="number" name="price_estimate" value={price_estimate} onChange={handleInputChange} className="form-control" />
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Close
                    </Button>
                    <Button onClick={handleSave} variant={variant}>Save</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default NewAppointment;
