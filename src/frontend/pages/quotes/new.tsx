/**
 * A NextPage to display a new quote request on the application when the customer chooses to make one.
 */

import { NextPage } from "next";
import CustomNavBar from "../../components/navigation/navBar";
import NewQuoteRequestContainer from "../../components/quotes/quoteRequestNewRequest";

const Quotes: NextPage = () => {

    return (
        <>
            <CustomNavBar />
            <NewQuoteRequestContainer selectedShops={[]} />
        </>
    );
};

export default Quotes;