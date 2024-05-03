/**
 * NextPage to display quote or quote request depending on the user type that is signed into the application.
 */

import { NextPage } from "next";
import QuotesCustomerContainer from "../components/quotes/quotesCustomerContainer";
import QuotesShopContainer from "../components/quotes/quotesShopContainer";
import CustomNavBar from "../components/navigation/navBar";
import { useAppContext } from "../context/state";
import QuotesLayout from "../components/quotes/quotesLayout";

const Quotes: NextPage = () => {
    const ctx = useAppContext();

    return (
        <>
            <CustomNavBar />
            <QuotesLayout>
                {ctx.user?.role ? (
                    <>{ctx.user.role === "customer" ? <QuotesCustomerContainer /> : <QuotesShopContainer />}</>
                ) : (
                    "Loading User Data..."
                )}
            </QuotesLayout>
        </>
    );
};

export default Quotes;
