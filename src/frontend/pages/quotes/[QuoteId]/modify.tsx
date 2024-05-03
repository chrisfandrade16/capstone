/**
 * A NextPage to display the quote request selected to be modified by the customer on the application.
 */

import { NextPage } from "next";
import CustomNavBar from "../../../components/navigation/navBar";
import QuoteRequestModify from "../../../components/quotes/quoteRequestModifyDetails";

const Quotes: NextPage = () => {
    return (
        <>
            <CustomNavBar />
            <QuoteRequestModify />
        </>
    );
};

export default Quotes;