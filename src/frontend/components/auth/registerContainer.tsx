/**
 * Container for the register account component of the application
 */

import React, { FunctionComponent, useState, useRef } from "react";
import { useRouter } from "next/router";
import { register } from "../../scripts/auth";
import { formatPhoneNum } from "../../scripts/inputFormatting";

import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";

const RegisterContainer: FunctionComponent = () => {
    const router = useRouter();
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState("");

    const passwordInputRef = useRef<HTMLInputElement>(null);
    const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form: HTMLFormElement = event.target as HTMLFormElement;
        let formData = new FormData(form);

        if (form.checkValidity()) {
            register(
                formData,
                () => {
                    router.push(
                        {
                            pathname: "./login",
                            query: {
                                type: "success",
                                message: "★ Registration successful!",
                            },
                        },
                        "./login"
                    );
                },
                (error: any) => {
                    setError(error.detail ?? "Error");
                    if (error.type === "USERNAME_EXISTS") {
                        usernameInputRef.current!.setCustomValidity(
                            error.detail
                        );
                    }
                }
            );
        }
        setValidated(true);
    };

    const checkPasswordMatch = (confirm: string) => {
        if (passwordInputRef.current?.value !== confirm) {
            confirmPasswordInputRef.current!.setCustomValidity(
                "Confirmed password does not match typed password!"
            );
            setError("Confirmed password does not match typed password!");
        } else {
            setError("");
        }
    };

    const formatPhoneStr = (event: React.FocusEvent<HTMLInputElement>) => {
        let formatted = formatPhoneNum(event.target.value);
        if (formatted !== null) {
            event.target.value = formatted;
        }
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
                <FloatingLabel
                    controlId="usernameInput"
                    label="Username"
                    className="mb-3"
                >
                    <Form.Control
                        ref={usernameInputRef}
                        type="text"
                        name="username"
                        placeholder="username"
                        required
                        onChange={(e) => {
                            e.target.setCustomValidity("");
                        }}
                    />
                </FloatingLabel>
                <FloatingLabel
                    controlId="passwordInput"
                    label="Password"
                    className="mb-3"
                >
                    <Form.Control
                        ref={passwordInputRef}
                        type="password"
                        name="password"
                        placeholder="password"
                        required
                    />
                </FloatingLabel>
                <FloatingLabel
                    controlId="passwordConfirmInput"
                    label="Confirm password"
                >
                    <Form.Control
                        ref={confirmPasswordInputRef}
                        type="password"
                        name="passwordConfirm"
                        placeholder="password"
                        required
                        onChange={(e) => {
                            e.target.setCustomValidity("");
                        }}
                        onBlur={(e) => {
                            checkPasswordMatch(e.target.value);
                        }}
                    />
                </FloatingLabel>
                <hr />
                <Row>
                    <Col>
                        <FloatingLabel
                            controlId="fnameInput"
                            label="First Name"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                name="firstName"
                                placeholder="firstName"
                                required
                            />
                        </FloatingLabel>
                    </Col>
                    <Col>
                        <FloatingLabel
                            controlId="lnameInput"
                            label="Last Name"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                name="lastName"
                                placeholder="lastName"
                                required
                            />
                        </FloatingLabel>
                    </Col>
                </Row>
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
                <FloatingLabel
                    controlId="phoneInput"
                    label="Phone"
                    className="mb-3"
                >
                    <Form.Control
                        type="tel"
                        name="phone"
                        placeholder="phone"
                        pattern="^\d{3}-\d{3}-\d{4}$"
                        onBlur={formatPhoneStr}
                        required
                    />
                </FloatingLabel>
                <FloatingLabel
                    controlId="roleInput"
                    label="Account type"
                    className="mb-3"
                >
                    <Form.Select name="role" defaultValue="" required>
                        <option value="" disabled hidden>
                            Choose here
                        </option>
                        <option value="c">Customer</option>
                        <option value="o">Shop Owner</option>
                    </Form.Select>
                </FloatingLabel>
                <Button type="submit">Register</Button>
                <Container className="p-0 mt-2">
                    <Row>
                        <Col className="text-end">
                            Already have an account?{" "}
                            <a href="./login">Sign in</a>
                        </Col>
                    </Row>
                </Container>
            </Form>
        </Container>
    );
};

export default RegisterContainer;
