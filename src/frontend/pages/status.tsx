/**
 * A NextPage used to test the login status of a user. 
 */

import type { NextPage } from "next";
import { useAppContext } from "../context/state";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { logout } from "../scripts/auth";

const Home: NextPage = () => {
    const ctx = useAppContext();
    const getRoleLabel = () => {
        if (ctx.user?.role === "o") return "Owner";
        else if (ctx.user?.role === "e") return "Employee";
        else if (ctx.user?.role === "c") return "Customer";
    };

    const statusColour = () => {
        return ctx.tokens?.authStatus === "signed-in"
            ? "text-success"
            : "text-danger";
    };

    const getChangeLoginLink = () => {
        return (
            <div>
                {ctx.tokens?.authStatus === "signed-in" ? (
                    <Button
                        onClick={() => {
                            logout(ctx);
                        }}
                    >
                        Sign Out
                    </Button>
                ) : (
                    <Button href="/auth/login">Sign In</Button>
                )}
            </div>
        );
    };

    return (
        <>
            <Container className="text-center mt-5">
                <h4>
                    Login Status:{" "}
                    <span className={statusColour()}>
                        {ctx.tokens?.authStatus}
                    </span>
                </h4>
                {/* conditionally render user info, only if user is logged in */}
                {ctx.user !== null ? (
                    <>
                        <h4>
                            Username:{" "}
                            <span className={statusColour()}>
                                {ctx.user?.username}
                            </span>
                        </h4>
                        <h4>
                            User Type:{" "}
                            <span className={statusColour()}>
                                {getRoleLabel()}
                            </span>
                        </h4>
                    </>
                ) : (
                    ""
                )}

                {getChangeLoginLink()}
            </Container>
        </>
    );
};

export default Home;
