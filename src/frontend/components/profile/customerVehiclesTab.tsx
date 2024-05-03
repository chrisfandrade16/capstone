/**
 * The component that handles that vehicles tab that is visible on the customer"s user profile.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { getUserVehicles, getVehicleMakes } from "./profileSlice";
import { useAppContext } from "../../context/state";
import { logout } from "../../scripts/auth";
import VehicleDetails from "./vehicleDetailsDisplay";
import VehicleModal from "./addVehicleModal";

import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";


const VehiclesTab = () => {

    const ctx = useAppContext();
    const router = useRouter();
    const [pageContents, setPageContents] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [vehiclesInfo, setVehiclesInfo] = useState(null);

    const handleAddVehicle = () => {
        getVehicleMakes().then((result) => {
            setVehiclesInfo(result);
            setModalShow(true);
        })
    };

    const buildVehiclesList = (vehiclesJSON) => {
        let output = []
        for (let i = 0; i < vehiclesJSON.length; i++) {
            output.push(<VehicleDetails vehicle={vehiclesJSON[i]} />)
        }
        return output;
    };

    const buildPage = () => {
        getUserVehicles(ctx.user.first_name, ctx.user.last_name).then((response) => {
            let pageContents = (
                <Row>
                    <Col md="auto">
                        <Container className="d-grid gap-2">
                            <Button variant="primary" onClick={handleAddVehicle}>Add Vehicle</Button>
                            <Button variant="secondary" onClick={handleRefresh}>Refresh</Button>
                        </Container>
                    </Col>
                    <Col>{buildVehiclesList(response)}</Col>
                </Row>
            )
            setPageContents(pageContents);
        });
    };

    const handleRefresh = (e) => {
        e.preventDefault();
        getUserVehicles(ctx.user.first_name).then((response) => {
            //console.log(response);
            buildPage();
        })
    };

    useEffect(() => {

        if (!ctx.user) {
            setPageContents(<p>Authentication error, redirecting...</p>);
            logout(ctx);
            router.push("/auth/login");
            return;
        }

        setPageContents(<p>Loading...</p>);

        getVehicleMakes().then((result) => {
            setVehiclesInfo(result);
            vehiclesInfo = result;
        }).then(() => {
            //console.log(vehiclesInfo);
            buildPage();
        })

    }, []);

    return (
        <>
            {pageContents}
            <VehicleModal show={modalShow} onHide={() => setModalShow(false)} vehiclesInfo={vehiclesInfo} />
        </>
    )
};

export default VehiclesTab;