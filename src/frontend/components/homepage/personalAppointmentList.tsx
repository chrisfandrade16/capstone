/**
 * A component to build a personal appointment list for the user to see on the homepage (currently not in use)
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "../../context/state";
import { getUserAppointments } from "./homepageSlice";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const PersonalAppointmentList = () => {

    const router = useRouter();
    const ctx = useAppContext();

    const [appointmentsContent, setAppointmentsContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    var response;
    
    useEffect(() => {
        if (!ctx.user) {
            router.push("/auth/login")
            return;
        }
        setIsLoading(true)
        response = getUserAppointments(ctx.user.id).then((out) => {
            setAppointmentsContent(out)
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

export default PersonalAppointmentList;