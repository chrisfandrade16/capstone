/**
 * A page used to display the forgot password page for any user type on the application.
 */

import { NextPage } from "next";
import ForgottenContainer from "../../components/auth/forgottenContainer";
import AuthLayout from "../../components/auth/authLayout";

const Login: NextPage = () => {
    return (
        <AuthLayout
            title="Password Recovery"
            iconClass="fa-solid fa-lock bg-primary"
        >
            <ForgottenContainer />
        </AuthLayout>
    );
};

export default Login;
