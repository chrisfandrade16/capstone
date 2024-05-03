/**
 * A functional component that handles the visual component of the status of a quote/quote request.
 */

import { useMemo, FC } from "react";
import { Badge } from "react-bootstrap";

type Props = {
    status: string;
};

const QuoteStatusBadge: FC<Props> = ({ status }) => {
    const bg = useMemo(() => {
        let bg = "";
        switch (status) {
            case "pending":
                bg = "info";
                break;
            case "booked":
                bg = "success";
                break;
            case "canceled":
                bg = "danger";
                break;
        }
        return bg;
    }, [status]);

    return <Badge bg={bg}>{status.toUpperCase()}</Badge>;
};

export default QuoteStatusBadge;
