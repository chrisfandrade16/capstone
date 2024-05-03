/**
 * Container for the reset password component of the application
 */

import React, { FunctionComponent, useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { confirmReset, validateResetRequest } from "../../scripts/auth";

import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import { Alert } from "react-bootstrap";

const ResetPasswordContainer: FunctionComponent = () => {
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState("");
    const [resetAuth, setResetAuth] = useState({ uid: "", token: "" });

    const passwordInputRef = useRef<HTMLInputElement>(null);
    const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const [validReset, setValidReset] = useState(false);
    const [waiting, setWaiting] = useState(true);

    // validate request uid and token before displaying page
    useEffect(() => {
        if (!router.isReady) return;
        const uid = router.query.u as string;
        const token = router.query.t as string;
        validateResetRequest(
            uid,
            token,
            (result: any) => {
                console.log(result);
                setValidReset(true);
                setWaiting(false);
                setResetAuth({ uid: uid, token: token });
            },
            () => {
                setValidReset(false);
                setWaiting(false);
            }
        );
    }, [router.isReady]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form: HTMLFormElement = event.target as HTMLFormElement;
        let formData = new FormData(form);

        if (form.checkValidity()) {
            confirmReset(
                resetAuth.uid,
                resetAuth.token,
                formData.get("password") as string,
                () => {
                    router.push(
                        {
                            pathname: "./login",
                            query: {
                                type: "success",
                                message:
                                    "★ Your password has been successfully changed!",
                            },
                        },
                        "./login"
                    );
                    router.push("./login");
                    setError("");
                },
                (error: any) => {
                    setError(error ?? "Error");
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

    if (waiting) return <p>Validating password reset request...</p>;

    return (
        <Container className="mt-3">
            <Collapse in={error !== ""}>
                <div className="text-danger text-center mb-3">{error}</div>
            </Collapse>
            {validReset ? (
                <Form
                    noValidate
                    validated={validated}
                    onSubmit={handleSubmit}
                    className="d-grid"
                >
                    <div className="mb-3">
                        Please enter your new password below.
                    </div>
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
                        className="mb-3"
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

                    <Button type="submit">Save Password</Button>
                    <Container className="p-0 mt-2">
                        <Row>
                            <Col className="text-end">
                                <a href="./login">Back to sign in</a>
                            </Col>
                        </Row>
                    </Container>
                </Form>
            ) : (
                <Alert variant="danger">
                    <Alert.Heading>
                        <i className="fa-solid fa-triangle-exclamation pe-2"></i>
                        Invalid password reset request
                    </Alert.Heading>
                    Your reset request may have expired. Please obtain a{" "}
                    <a className="text-nowrap" href="./forgotten">
                        new reset link.
                    </a>
                </Alert>
            )}
        </Container>
    );
};

export default ResetPasswordContainer;
