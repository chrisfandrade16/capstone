/**
 * A page used to display the login page for a user of any account type on the application.
 */

import { NextPage } from "next";
import LoginContainer from "../../components/auth/loginContainer";
import AuthLayout from "../../components/auth/authLayout";
import { useRouter } from "next/router";
import Alert from "react-bootstrap/Alert";

const Login: NextPage = () => {
    const router = useRouter();
    return (
        <>
            {/* message display using query {type: string, message: string} */}
            {router.query["message"] !== undefined ? (
                <Alert
                    variant={router.query["type"] as string}
                    className="p-2 shadow text-center fw-bold corner-sharp rounded-0"
                >
                    {router.query["message"]}
                </Alert>
            ) : (
                ""
            )}
            <AuthLayout title="Log in" iconClass="fa-solid fa-lock bg-primary">
                <LoginContainer />
            </AuthLayout>
        </>
    );
};

export default Login;
