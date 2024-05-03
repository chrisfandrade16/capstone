/**
 * Base page for the application
 */

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import "../styles/TimePicker.css";
import "react-rrule-generator/build/styles.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "leaflet/dist/leaflet.css";
import Head from "next/head";
import Script from "next/script";
import type { AppProps } from "next/app";
import { AppWrapper } from "../context/state";
import SessionWrapper from "../components/session/sessionWrapper";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Sayyara App</title>
            </Head>
            <Script
                src="https://kit.fontawesome.com/d5df2731d5.js"
                // crossorigin="anonymous"
            />
            <AppWrapper>
                <SessionWrapper>
                    <Component {...pageProps} />
                </SessionWrapper>
            </AppWrapper>
        </>
    );
}

export default MyApp;
