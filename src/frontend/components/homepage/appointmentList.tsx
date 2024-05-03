/**
 * Builds the appointment list to display on the Appointments page based on user's appointments
 */

import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useAppContext } from "../../context/state";
import { getShopAppointments } from "./homepageSlice";

const AppointmentList = () => {

    const router = useRouter();
    const ctx = useAppContext();

    const [appointmentsContent, setAppointmentsContent] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    var response;

    useEffect(() => {
        if (!ctx.user) {
            router.push("/auth/login")
            return;
        }
        setIsLoading(true)
        response = getShopAppointments(1).then((outJson) => {
            setAppointmentsContent(outJson)
            setIsLoading(false)
        })
    }, []);

    const buildAppointmentsList = () => {
        if (isLoading) {
            return <p>Loading...</p>
        } else {
            console.log(appointmentsContent)
            let result = []
            for (let i = 0; i < appointmentsContent.length; i++) {
                result.push(addAppointmentCard(appointmentsContent[i], i))
            }
            return result
        }
    };

    const addAppointmentCard = (appointmentJSON, index) => {
        let appCard =
            <Card key={index} className={"text-black"}>
                <Card.Header>
                    <Container></Container>
                    {appointmentJSON.shop?.name}
                </Card.Header>
                <Card.Body>
                    <Card.Title>{appointmentJSON.title}</Card.Title>
                    <Card.Text>{appointmentJSON.description}</Card.Text>
                    <Button variant="primary" href={`appointments/${appointmentJSON.id}`}>View Details</Button>
                </Card.Body>
            </Card>
        return appCard;
    };

    return (
        <Container style={{ padding: "20px 15px 0 15px" }}>
            {buildAppointmentsList()}
        </Container>
    );
};

export default AppointmentList;