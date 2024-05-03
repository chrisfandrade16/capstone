/**
 * A component to handle the visual card that appears for each individual shop that is displayed on the shop lookup page on the application.
 */

import React from "react";
import { Form } from "react-bootstrap";

import { GeoLocation, Shop } from "../types";
import { getDistance } from "../../scripts/distance";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const ShopCard = ({ shop, locationQuery }: { shop: Shop, locationQuery: GeoLocation }) => {

    let shopRoute = `/details/${shop.id}`;

    return (
        <div>
            <Card
                style={{ width: "80%", backgroundColor: "rgb(48,48,48", color: "rgb(240,240,240)" }}
            >
                <Card.Header as="h4">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        &nbsp;&nbsp;{shop.name}
                        <Form.Check>
                        </Form.Check>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Container>
                        <Row>
                            <Col>
                                <Card.Text>
                                    {shop.address}
                                </Card.Text>
                            </Col>
                            <Col style={{ textAlign: "right" }}>
                                <Card.Text>
                                    <a href={`tel:${shop.phone}`}>{shop.phone}</a>
                                </Card.Text>
                                <Card.Text>
                                    <a href={`mailto:${shop.email}`}>{shop.email}</a>
                                </Card.Text>
                            </Col>
                            <p></p>
                            <hr></hr>
                            <Card.Text>
                                {shop.description}
                            </Card.Text>
                            <p></p>
                            <Col>
                                <Button href={shopRoute} variant="primary">Shop Details</Button>
                            </Col>
                            <Col style={{ textAlign: "right" }}>
                                {isNaN(getDistance(locationQuery.latitude, locationQuery.longitude, shop.latitude, shop.longitude)) ? "" : getDistance(locationQuery.latitude, locationQuery.longitude, shop.latitude, shop.longitude) + " km away"}
                            </Col>
                        </Row>
                    </Container>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ShopCard;