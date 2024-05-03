/**
 * The main/index page of the application that the user sees when they log in.
 * The information displayed is based on their user type (customer or shop),
 * or if they are not signed in, they will see the default splash page.
 */

import { useState, useEffect } from "react";
import { useAppContext } from "../context/state";
import SplashCardGrid from "../components/homepage/cardGroup";
import CustomNavBar from "../components/navigation/navBar";
import { getNumShopAppointments, getNumUserAppointments, getNumShopQuotes } from "../components/homepage/homepageSlice";
// import AppointmentList from "../components/homepage/appointmentList";
// import PersonalAppointmentList from "../components/homepage/personalAppointmentList";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";

const Home = () => {
    const ctx = useAppContext();

    const [cardContent, setCardContent] = useState([]);

    const buildUserPage = async (ctx) => {
        let nApp = await getNumUserAppointments(ctx.user.id)
        console.log(nApp)
        setCardContent([{ title: "Appointments", text: nApp }])
    };

    const buildShopPage = async (ctx) => {
        let nApp = await getNumShopAppointments(ctx.user.id)
        let nQuotes = await getNumShopQuotes(ctx.user.id, ctx.tokens.accessToken)
        console.log(nApp)
        console.log(nQuotes)
        setCardContent([
            { title: "Appointments", text: nApp },
            { title: "Quotes", text: nQuotes }
        ])
    };

    useEffect(() => {
        if (ctx.user) {
            if (ctx.user.role == "customer") {
                buildUserPage(ctx)
            } else {
                buildShopPage(ctx)
            }
        }
    }, []);

    const UserGreeting = () => {
        return (
            <Container style={{ padding: "20px 15px 0 15px" }}>
                <h2>Welcome, {ctx.user?.first_name} {ctx.user?.last_name}</h2>
            </Container>
        );
    };

    // Number of upcoming appointments
    // const AppointmentSummary = () => {
    //     return <Container><h4>You have {numAppointments} upcoming appointments</h4></Container>
    // };

    // const AppointmentContent = () => {
    //   if (ctx.user?.role == "customer" || ctx.user?.role == "employee") {
    //     return <PersonalAppointmentList/>
    //   } else if (ctx.user?.role == "shopowner") {
    //     return <AppointmentList/>
    //   }
    // };

    const PageContent = () => {
        return (ctx.user) ? (
            <Container className="d-flex justify-content-center flex-wrap" >
                <UserGreeting />
                {cardContent.map((card, index) => (
                    <Card key={index} bg="dark" style={{ width: "200px", height: "200px", margin: "10px" }}>
                        <Card.Body style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <Card.Title>{card.title}</Card.Title>
                            <Card.Text style={{ fontSize: "20px" }}>
                                {card.text}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                ))}
            </Container>
        ) : (
            <SplashCardGrid />
        )
    };

    return (
        <>
            <div>
                <CustomNavBar />
            </div>
            {/* <div>
                <SearchBar />
            </div> */}
            <PageContent />
        </>
    );
};

export default Home;
