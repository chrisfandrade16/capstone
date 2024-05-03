/**
 * A functional component for the visual component of the quotes page on the shop side of the application.
 */

import React, { FunctionComponent } from "react";

import Card from "react-bootstrap/Card";

type Props = {
    children: React.ReactNode; // 👈️ added type for children
};

const QuotesLayout: FunctionComponent<Props> = ({ children }) => {
    return <Card className={"shadow p-3 tw-text-black tw-font-normal container mt-4"}>{children}</Card>;
};

export default QuotesLayout;
