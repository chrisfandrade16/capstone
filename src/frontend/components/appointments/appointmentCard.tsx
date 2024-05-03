/**
 * Returns the visual component of a single, basic appointment on the Appointments page
 */

import React from "react";
import { Appointment } from "../types";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import ListGroupItem from "react-bootstrap/ListGroupItem";
import Link from "next/link";

const formatDateTime = (date: string) => {
    const d = new Date(date);
    const date_str = d.toDateString();
    const time_str = d.toLocaleTimeString();
    // Human readable date time string
    return `${date_str} at ${time_str}`;
};

interface AppointmentCardProps {
    appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
    const { title, description, reservation, time_estimate, price_estimate } = appointment;
    const formattedReservation = formatDateTime(reservation.time);

    return (
        <Link href={`/appointments/${appointment.id}`} style={{ textDecoration: "none" }}>
            <Card style={{ width: "18rem", margin: "10px", backgroundColor: "#343a40", cursor: "pointer", transition: "all 0.3s ease-in-out" }} className="card-hover">
                <Card.Body>
                    <Card.Title style={{ color: "#fff" }}>{title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted" style={{ color: "#fff" }}>{formattedReservation}</Card.Subtitle>
                    <Card.Text style={{ color: "#fff" }}>{description}</Card.Text>
                </Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>{time_estimate} hours</ListGroupItem>
                    <ListGroupItem>${price_estimate}</ListGroupItem>
                </ListGroup>
            </Card>
        </Link>
    );
};

export default AppointmentCard;