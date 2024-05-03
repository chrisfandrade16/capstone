/**
 * Container for forgotten password content
 */

import React, { FunctionComponent, useState } from "react";
import { useRouter } from "next/router";
import { initiateReset } from "../../scripts/auth";

import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Alert from "react-bootstrap/Alert";

const ForgottenContainer: FunctionComponent = () => {
    const router = useRouter();
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form: HTMLFormElement = event.target as HTMLFormElement;
        let formData = new FormData(form);

        if (form.checkValidity()) {
            setCountdown(60);
            const emailTimeout = setInterval(() => {
                console.log("tick");
                setCountdown((old) => {
                    if (old > 0) return old - 1;
                    else {
                        clearInterval(emailTimeout);
                        return old;
                    }
                });
            }, 1000);

            initiateReset(
                formData,
                () => {
                    setSuccess(true);
                    setError("");
                },
                (error: any) => {
                    setError(error ?? "Error");
                    clearInterval(emailTimeout);
                    setCountdown(0);
                }
            );
        }
        setValidated(true);
    };

    return (
        <Container className="mt-3">
            <Collapse in={error !== ""}>
                <div className="text-danger text-center mb-3">{error}</div>
            </Collapse>
            <Form
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
                className="d-grid"
            >
                <div className="mb-3">
                    Enter the email address associated with your account below
                    and recovery instructions will be sent.
                </div>
                <FloatingLabel
                    controlId="emailInput"
                    label="Email"
                    className="mb-3"
                >
                    <Form.Control
                        type="email"
                        name="email"
                        placeholder="email"
                        required
                    />
                </FloatingLabel>
                <Button type="submit" disabled={countdown > 0}>
                    {success ? "Re-send " : "Send "}Email{" "}
                    {countdown > 0 ? `(Wait ${countdown} seconds)` : ""}
                </Button>
                <Collapse in={success}>
                    <div>
                        <Alert variant="success" className="mt-3">
                            Password recovery instructions have been sent to the
                            supplied email address. This process may take
                            several minutes.
                        </Alert>
                    </div>
                </Collapse>
                <Container className="p-0 mt-2">
                    <Row>
                        <Col className="text-end">
                            <a href="./login">Back to sign in</a>
                        </Col>
                    </Row>
                </Container>
            </Form>
        </Container>
    );
};

export default ForgottenContainer;
