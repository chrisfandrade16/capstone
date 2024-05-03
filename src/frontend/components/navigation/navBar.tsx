/**
 * The component to handle the navigation bar on the application. This differs based on the user account that is signed in (customer or shop).
 */

import type { NextPage } from "next";
import { useRouter } from "next/router";
import Container from "react-bootstrap/Container";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useAppContext } from "../../context/state";
import { logout } from "../../scripts/auth";
import NotificationPanel from "./notificationPanel";

const CustomNavBar: NextPage = () => {
    const priviledgedUsrs = ["shopowner", "employee"]
    const ctx = useAppContext();
    const router = useRouter();

    const handleProfileClick = (e: any) => {
        e.preventDefault();
        if (ctx.user) {
            router.push("/profile/profile")
            return
        }
        router.push("/auth/login")
        return
    }

    const handleLogoutClick = (e: any) => {
        e.preventDefault();
        logout(ctx);
        router.push("/");
        return;
    }

    const MyShopLink = () => {
        if (ctx.user?.role === "shopowner") {
            return (
                <NavDropdown title="My Shop">
                    <NavDropdown.Item href="/shop/employees/manage">
                        Employees
                    </NavDropdown.Item>
                    <NavDropdown.Item href="/shop/services/manage">
                        Services
                    </NavDropdown.Item>
                    <NavDropdown.Item href="/shop/profile/manage">
                        Profile
                    </NavDropdown.Item>
                </NavDropdown>
            );
        } else {
            return null;
        }
    };
    const AppointmentLink = () => {
        if (ctx.user) {
            return <Nav.Link href="/appointments">Appointments</Nav.Link>;
        } else {
            return null;
        }
    };

    const WorkOrdersLink = () => {
        if (ctx.user?.role === "shopowner" || ctx.user?.role === "employee") {
            return <Nav.Link href="/shop/workorders">Work Orders</Nav.Link>;
        } else {
            return null;
        }
    };

    const LookupLink = () => {
        if (ctx.user && !priviledgedUsrs.includes(ctx.user?.role)) {
            return <Nav.Link href="/lookup">Shop Lookup</Nav.Link>;
        } else {
            return null;
        }
    };

    const CalendarLink = () => {
        if (ctx.user?.role == "shopowner")
            return <Nav.Link href="/shop/calendar">Shop Calendar</Nav.Link>
        if (ctx.user?.role == "employee")
            return <Nav.Link href="/employees/calendar">My Calendar</Nav.Link>
        return null
    }

    const QuoteLink = () => {
        if (ctx.user) {
            return <Nav.Link href="/quotes">Quotes</Nav.Link>;
        } else {
            return null
        }
    }

    // Automatically switches from login to profile details
    const ProfileLink = () => {
        if (ctx.user) {
            //href="/profile/profile"
            return (
                <>
                    <Nav.Link onClick={handleProfileClick}>
                        <i className="fa-solid fa-user me-2" />
                        {ctx.user.username}
                    </Nav.Link>
                    <Nav.Link onClick={handleLogoutClick}>Logout</Nav.Link>
                </>
            );
        }
        // href="/auth/login"
        return <Nav.Link onClick={handleProfileClick}>Login</Nav.Link>
    }

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand onClick={() => { router.push("/") }}>Sayyara</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <LookupLink />
                        <QuoteLink />
                        <MyShopLink />
                        <AppointmentLink />
                        <CalendarLink />
                        <WorkOrdersLink />
                    </Nav>
                    {ctx.user ? <NotificationPanel userId={ctx.user?.id} /> : ""}
                    <Nav className="justify-content-end">
                        <ProfileLink />
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default CustomNavBar;
