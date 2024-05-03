/**
 * A functional component to handle the session wrapper of a signed in user's session on the application.
 */

import React, { FunctionComponent, useEffect } from "react";
import { useAppContext } from "../../context/state";
import { verifyTokens, resetTokens } from "../../scripts/auth";

type Props = {
    children: React.ReactNode; // 👈️ added type for children
};

const SessionWrapper: FunctionComponent<Props> = ({ children }) => {
    const ctx = useAppContext();
    useEffect(() => {
        if (ctx.tokens === null) {
            const accessToken = localStorage.getItem("accessToken");
            if (accessToken) {
                console.log("verifying token");
                verifyTokens(ctx, accessToken);
            } else {
                console.log("no stored token found");
                // intialize token if no saved token found
                resetTokens(ctx);
            }
        }
    }, [ctx.tokens]);
    return <>{children}</>;
};

export default SessionWrapper;
