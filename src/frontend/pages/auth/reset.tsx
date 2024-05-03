/**
 * A page used to display the reset password information page for any user account type on the application.
 */

import { NextPage } from "next";
import ResetPasswordContainer from "../../components/auth/resetPasswordContainer";
import AuthLayout from "../../components/auth/authLayout";

const Login: NextPage = () => {
    return (
        <AuthLayout
            title="Password Reset"
            iconClass="fa-solid fa-lock bg-primary"
        >
            <ResetPasswordContainer />
        </AuthLayout>
    );
};

export default Login;
