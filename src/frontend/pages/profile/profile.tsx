/**
 * A NextPage used to display the profile information of a user that is signed in the application.
 * Customer: vehicles
 * Employee: availability
 * Shop owner: shop details
 */

import type { NextPage, FC } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";

import { useAppContext } from "../../context/state";
import { logout } from "../../scripts/auth";
import PersonalDetailsTab from "../../components/profile/personalDetailsTab";
import VehiclesTab from "../../components/profile/customerVehiclesTab";
import AvailabilityPage from "./availability";
import CustomNavBar from "../../components/navigation/navBar";

const pageTab: FC = (eventKey: string, title: string, contents: FC, key: int) => {
    return <Tab eventKey={eventKey} title={title} key={key}>{contents}</Tab>
}

const Profile: NextPage = () => {

    // Set this to true to see every tab
    const pageDebug = true;

    const ctx = useAppContext();
    const router = useRouter();
    const [pageContents, setPageContents] = useState(null);

    const handleLogoutClick: void = (event) => {
        event.preventDefault();
        logout(ctx);
        router.push("/");
        return;
    }

    useEffect(() => {
        if (!ctx.tokens) {
            setPageContents(<p>Authentication error, redirecting...</p>);
            logout(ctx);
            router.push("/auth/login");
            return;
        }

        let detailsTab = pageTab("detailsTab", "Personal Details", <PersonalDetailsTab />, 0);
        let vehiclesTab = pageTab("vehiclesTab", "My Vehicles", <VehiclesTab />, 1);
        // let shopTab = pageTab("shopTab", "My Shops", <p>Shop page</p>, 2);
        let employeeTab = pageTab("employeeTab", "Availability", <AvailabilityPage />, 3);

        if (ctx.user?.role == "customer") {
            var displayTabs = [detailsTab, vehiclesTab]
        } else if (ctx.user?.role == "shopowner") {
            var displayTabs = [detailsTab]
        } else {
            var displayTabs = [detailsTab, employeeTab]
        }

        if (pageDebug) {
            displayTabs = [detailsTab, vehiclesTab, employeeTab]
        }

        setPageContents(
            <>
                <div>
                    <CustomNavBar />
                </div>
                <Container>
                    <Row>
                        <Col>
                            <h1 className="text-center text-3xl font-bold">Profile</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="profile-editor">
                            <PersonalDetailsTab />
                        </Col>
                        <Col>
                            <VehiclesTab />
                        </Col>
                    </Row>
                    <Row>
                        <AvailabilityPage />
                    </Row>
                </Container>
            </>
        );
    }, []);

    return pageContents;
};

export default Profile;