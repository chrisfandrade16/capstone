/**
 * Container for the login component of the application
 */

import React, { FunctionComponent, useState, useRef } from "react";
import { Shop, useAppContext } from "../../context/state";
import { useRouter } from "next/router";
import { login, getUserProfile } from "../../scripts/auth";

import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import {
    AFFLIATED_URL_WITH_ID,
    METHOD_TYPES,
    request,
    SHOPS_URL,
} from "../../scripts/request";

const LoginContainer: FunctionComponent = () => {
    const ctx = useAppContext();
    const router = useRouter();
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState("");

    const usernameInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form: HTMLFormElement = event.target as HTMLFormElement;
        usernameInputRef.current!.value = usernameInputRef.current!.value.trim();
        passwordInputRef.current!.value = passwordInputRef.current!.value.trim();
        event.preventDefault();
        if (form.checkValidity()) {
            const data = new FormData(form);
            login(
                ctx,
                (data.get("username") as string).toLowerCase(),
                data.get("password") as string,
                async (result: any) => {
                    const user = await getUserProfile(ctx, result.access);

                    if (user.role === "shopowner") {
                        const shop_result = await request(
                            AFFLIATED_URL_WITH_ID(user.id.toString()),
                            null,
                            null
                        );
                        if (shop_result.failure) {
                            router.push("../shop/profile/create");
                            return;
                        }
                    }

                    router.push("/");
                },
                (result: any) => {
                    console.log(result);
                    setError(result.detail ?? "Error");
                    form.reset();
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
                <FloatingLabel
                    controlId="usernameInput"
                    label="Username"
                    className="mb-3"
                >
                    <Form.Control
                        ref={usernameInputRef}
                        required
                        type="text"
                        autoComplete="username"
                        name="username"
                        placeholder="username"
                    />
                    <Form.Control.Feedback type="invalid">
                        Please provide a valid username
                    </Form.Control.Feedback>
                </FloatingLabel>
                <FloatingLabel
                    controlId="passwordInput"
                    label="Password"
                    className="mb-3"
                >
                    <Form.Control
                        ref={passwordInputRef}
                        required
                        type="password"
                        autoComplete="password"
                        name="password"
                        placeholder="password"
                    />
                    <Form.Control.Feedback type="invalid">
                        Please provide a valid password
                    </Form.Control.Feedback>
                </FloatingLabel>
                <Form.Check
                    type="checkbox"
                    id="remember"
                    label="Remember me"
                    className="mb-3"
                />
                <Button type="submit">Sign In</Button>
                <Container className="p-0 mt-3">
                    <Row>
                        <Col>
                            <a href="./forgotten">Forgot password?</a>
                        </Col>
                        <Col className="text-end">
                            Don't have an account?{" "}
                            <a href="./register">Sign Up</a>
                        </Col>
                    </Row>
                </Container>
            </Form>
        </Container>
    );
};

export default LoginContainer;
