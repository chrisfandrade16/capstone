/**
 * A page used to display the register account page for any desired account type on the application.
 */

import { NextPage } from "next";
import RegisterContainer from "../../components/auth/registerContainer";
import AuthLayout from "../../components/auth/authLayout";

const Login: NextPage = () => {
    return (
        <AuthLayout
            title="Account Registration"
            iconClass="fa-solid fa-star bg-primary"
        >
            <RegisterContainer />
        </AuthLayout>
    );
};

export default Login;
