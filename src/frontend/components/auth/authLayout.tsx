/**
 * Layout container for the authorization (login/register) page
 */

import React, { FunctionComponent } from "react";

import Card from "react-bootstrap/Card";
import styles from "../../styles/Auth.module.css";

type Props = {
    iconClass: string;
    title: string;
    children: React.ReactNode; // 👈️ added type for children
};

const AuthLayout: FunctionComponent<Props> = ({
    title,
    children,
    iconClass,
}) => {
    return (
        <Card
            className={
                "shadow p-3 tw-text-black tw-font-normal " + styles.loginContainer
            }
        >
            <Card.Title className="text-center">
                <div>
                    <i className={`${iconClass} p-3 mb-2 ${styles.lockIcon}`}></i>
                </div>
                {title}
            </Card.Title>
            {children}
        </Card>
    );
};

export default AuthLayout;
