/**
 * Layout of Appointments page on website
 */

import { ReactNode } from "react";
import { Container, Row, Col } from "react-bootstrap";

const AppointmentsLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <Container>
                <Row className="my-3">
                    <Col>
                        <h1 className="text-center text-3xl font-bold">Appointments</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>{children}</Col>
                </Row>
            </Container>
        </div>
    );
};

export default AppointmentsLayout;