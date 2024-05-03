/**
 * A NextPage that displays when the shop owner decides to create a new employee account for their shop and that employee creates the account.
 */

import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import { formatPhoneNum } from "../../../scripts/inputFormatting";
import { NextPage } from "next";

import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import AuthLayout from "../../../components/auth/authLayout";
import {
    EMPLOYEE_URL_WITH_ID,
    METHOD_TYPES,
    request,
} from "../../../scripts/request";

const CreateEmployee: NextPage = () => {
    const router = useRouter();
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState("");

    const passwordInputRef = useRef<HTMLInputElement>(null);
    const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form: HTMLFormElement = event.target as HTMLFormElement;
        let formData = new FormData(form);

        const employeeData = {
            username: (formData.get("username") as string).toLowerCase(),
            password: formData.get("password") as string,
            first_name: formData.get("firstName") as string,
            last_name: formData.get("lastName") as string,
            phone: formData.get("phone") as string,
        };

        if (form.checkValidity()) {
            const activate_employee_result = await request(
                EMPLOYEE_URL_WITH_ID(router.query.u as string),
                METHOD_TYPES.CREATE,
                employeeData
            );
            if (activate_employee_result.failure) {
                setError(activate_employee_result.failure);
            } else {
                router.push({
                    pathname: "../../auth/login",
                    query: {
                        type: "success",
                        message: "★ Registration successful!",
                    },
                });
            }
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
        <AuthLayout
            title="Employee Account Activation"
            iconClass="fa-solid fa-star bg-primary"
        >
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
                    <FloatingLabel controlId="phoneInput" label="Phone" className="mb-3">
                        <Form.Control
                            type="tel"
                            name="phone"
                            placeholder="phone"
                            pattern="^\d{3}-\d{3}-\d{4}$"
                            onBlur={formatPhoneStr}
                            required
                        />
                    </FloatingLabel>
                    <Button type="submit">Activate Employee Account</Button>
                </Form>
            </Container>
        </AuthLayout>
    );
};

export default CreateEmployee;
