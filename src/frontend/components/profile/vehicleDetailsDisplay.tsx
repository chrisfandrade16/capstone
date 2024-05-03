/**
 * A visual component to display a user's vehicle details on their profile
 */

import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

const VehicleDetails = (props) => {
    return (
        <Card className="tw-text-black">
            <Card.Body>
                <Card.Title>
                    <Row>
                        <Col>
                            {props.vehicle.year} {props.vehicle.make} {props.vehicle.model}
                        </Col>
                        <Col md="auto">
                            <Button>View Quotes</Button>
                        </Col>
                        <Col md="auto">
                            <Button variant="danger">Remove</Button>
                        </Col>
                    </Row>
                </Card.Title>
                <Card.Text>
                    <ListGroup>
                        <ListGroup.Item key={0}>VIN: {props.vehicle.vin}</ListGroup.Item>
                        <ListGroup.Item key={1}>
                            Plate: {props.vehicle.plate_number}
                        </ListGroup.Item>
                    </ListGroup>
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default VehicleDetails;
