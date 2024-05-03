/**
 * Returns a visual appointment card with additional details
 */

import React, { useState, useEffect } from "react";
import { AppointmentDetail, Reservation, ShopService } from "../types";
import { Accordion, Container, Row, Col, Card, ListGroup, ListGroupItem, Button, InputGroup, ButtonGroup, Form } from "react-bootstrap";
import QuoteStatusBadge from "../quotes/quoteStatusBadge";
import { Employee, getEmployees } from "../../scripts/employee";

interface AppointmentDetailCardProps {
    appointment: AppointmentDetail;
    isPrivileged: boolean;
    onSave: (appointment: AppointmentDetail) => void;
    onCancel: () => void;
}

const formatDateTime = (reservation: Reservation) => {
    const d = new Date(reservation?.time);
    const date_str = d.toDateString();
    const time_str = d.toLocaleTimeString();
    // Human readable date time string
    return `${date_str} at ${time_str} for ${reservation?.duration} hours`;
};

const AppointmentDetailCard: React.FC<AppointmentDetailCardProps> = ({ appointment, isPrivileged, onSave, onCancel }) => {

    const [editMode, setEditMode] = useState(false);
    const [updatedAppointment, setUpdatedAppointment] = useState(appointment);
    const { title, description, reservation, time_estimate, message, customer, quote, shop, price_estimate } = updatedAppointment;
    const formattedReservation = formatDateTime(reservation);
    const [variant, setVariant] = useState("primary");
    const [shopEmployees, setShopEmployees] = useState<Employee[]>([]);
    if (isPrivileged && shopEmployees.length == 0 && shop != undefined) {
        getEmployees(shop?.id, (employees: Employee[]) => {
            setShopEmployees(employees);
        });
    }

    useEffect(() => {
        setUpdatedAppointment(appointment);
        // console.log(appointment)
    }, [appointment]);


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUpdatedAppointment(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSave = () => {
        // console.log(updatedAppointment)
        onSave(updatedAppointment);
        setEditMode(false);
        setVariant("success");
        setTimeout(() => {
            setVariant("primary");
        }, 1000);
    };

    const handleReservationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUpdatedAppointment(prevState => ({
            ...prevState,
            reservation: {
                ...prevState.reservation,
                [name]: value
            }
        }));
    };

    const handleEmployeeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedEmployee = shopEmployees.find((employee) => employee.username === event.target.value);
        if (selectedEmployee) {
            setUpdatedAppointment((prevAppointment) => ({
                ...prevAppointment,
                reservation: {
                    ...prevAppointment.reservation,
                    schedule: selectedEmployee.id,
                },
            }));
        }
    };

    const handleCancel = () => {
        setUpdatedAppointment(appointment);
        setEditMode(false);
        if (onCancel) onCancel();
    };

  return (
    <Container className='mt-4'>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title className='text-black w-100'>{editMode ? <input type="text" name="title" value={title} onChange={handleInputChange} className="form-control" /> : title}</Card.Title>
                {isPrivileged && !editMode && 
                <Button onClick={() => setEditMode(true)} variant={variant} className={'tw-[36px]'}>
                  <i className="fa-solid fa-pen" /></Button>
                }
                {isPrivileged && editMode && 
                <>
                <ButtonGroup className='px-1'>
                  <Button onClick={handleSave} variant={variant}>Save</Button>
                  <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                </ButtonGroup>
                </>
                }
              </div>
              {isPrivileged && editMode && (
                <InputGroup className="mb-3">
                  <InputGroup.Text>Employee:</InputGroup.Text>
                   {shopEmployees && shopEmployees.length > 0 ? (
                  <Form.Select
                    name="employee_id"
                    value={shopEmployees.find((employee) => employee.id === appointment.reservation.schedule)?.username}
                    onChange={handleEmployeeChange}
                    className="form-control">
                    {shopEmployees.map((employee) => (
                        <option key={employee.id} value={employee.username}>
                            {employee.first_name} {employee.last_name}
                        </option>
                    ))}
                </Form.Select>
                  ) : <p>Loading employees</p>}
                </InputGroup>
              )}
              {isPrivileged && !editMode && (
                <Card.Subtitle className="mb-2 text-muted">Employee: {shopEmployees.find((employee) => employee.id == appointment.reservation.schedule)?.first_name}</Card.Subtitle>
              )}
              <Card.Subtitle className="mb-2 text-muted">{formattedReservation}</Card.Subtitle>
              <Card.Text className='text-black'>{editMode ? <textarea name="description" value={description} onChange={handleInputChange} className="form-control" /> : description}</Card.Text>
              <ListGroup>
                <ListGroupItem>Time Estimate: {editMode ? 
                <InputGroup >
                <input type="duration" name="time_estimate" value={time_estimate} onChange={handleInputChange} className="form-control" /> 
                <InputGroup.Text>hours</InputGroup.Text>
                </InputGroup>
                : `${time_estimate} hours`}
                </ListGroupItem>
                <ListGroupItem>Message: {editMode ? <textarea name="message" value={message} onChange={handleInputChange} className="form-control" /> : message}</ListGroupItem>
                <ListGroupItem>Customer: {customer?.first_name}</ListGroupItem>
                {!isPrivileged ?
                  <>
                  <ListGroupItem>Shop: {shop?.name}</ListGroupItem>
                  <ListGroupItem>Address: {shop?.address}</ListGroupItem>
                  <ListGroupItem>Phone: {shop?.phone}</ListGroupItem>
                  </>:<></>
                }
                {isPrivileged && editMode && (
                  <ListGroupItem>
                    Reservation:
                    <InputGroup>
                      <InputGroup.Text>Date:</InputGroup.Text>
                      <input type="datetime-local" name="time" value={reservation.time} onChange={handleReservationChange} className="form-control" />
                      <InputGroup.Text>Duration:</InputGroup.Text>
                      <input type="duration" name="duration" value={reservation.duration} onChange={handleReservationChange} className="form-control" />
                    </InputGroup>
                  </ListGroupItem>
                )}
                <ListGroupItem>Price Estimate: ${editMode ? <input type="number" name="price_estimate" value={price_estimate} onChange={handleInputChange} className="form-control" /> : price_estimate}</ListGroupItem>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title className='text-black'>Quote Details</Card.Title>
              <Accordion>
                {(quote?.status !== undefined) ?
                <>
                <QuoteStatusBadge status={quote.status} />
                <ListGroup className='mt-2'>
                  <ListGroupItem>Priority: {quote.priority}</ListGroupItem>
                  <ListGroupItem>Message: {quote.message}</ListGroupItem>
                </ListGroup>
                </>
                : <p>No quote</p>
                }
                {quote?.services.length > 0 ? (
                  quote?.services.map((serv: ShopService, index: number) => {
                    return (
                      <Accordion.Item eventKey={index.toString()}>
                        <Accordion.Header>{`${serv.name} - ${serv.price}`}</Accordion.Header>
                        <Accordion.Body>
                          <p>{serv.description}</p>
                          <p>Time Estimate: {serv.est_time}</p>
                        </Accordion.Body>
                      </Accordion.Item>
                    );
                  })
                ) : (
                  <p>No services</p>
                )}
              </Accordion>
            </Card.Body>
          </Card>
          <Card style={{marginTop: "20px"}}>
            <Card.Body className='text-black'>
              <Card.Title>Vehicle Details</Card.Title>
              <ListGroup>
                <ListGroupItem>Make: {quote?.quote_request.vehicle?.make}</ListGroupItem>
                <ListGroupItem>Model: {quote?.quote_request.vehicle?.model}</ListGroupItem>
                <ListGroupItem>Year: {quote?.quote_request.vehicle?.year}</ListGroupItem>
                <ListGroupItem>License Plate: {quote?.quote_request.vehicle?.plate_number}</ListGroupItem>
                <ListGroupItem>VIN: {quote?.quote_request.vehicle?.vin}</ListGroupItem>
              </ListGroup>
            </Card.Body>
          </Card>
          <Card style={{marginTop: "20px"}}>
            <Card.Body className='text-black'>
              <Card.Title>Quote Request Details</Card.Title>
              <ListGroup>
                <ListGroupItem>Description: {quote?.quote_request?.description}</ListGroupItem>
                <ListGroupItem>Part Preference: {quote?.quote_request?.part_preference}</ListGroupItem>
                <ListGroupItem>Availability: {quote?.quote_request?.availability}</ListGroupItem>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AppointmentDetailCard;