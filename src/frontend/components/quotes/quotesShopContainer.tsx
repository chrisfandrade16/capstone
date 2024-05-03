/**
 * This is the functional component that configures the display of the shop quotes in the application in a table format.
 */

import { useRouter } from "next/router";
import { FunctionComponent, useState, useEffect, useMemo } from "react";
import { Form, Table, Button } from "react-bootstrap";
import styles from "../../styles/Quotes.module.css";

import { Shop, Quote } from "../../components/types";
import { useAppContext } from "../../context/state";
import { getShopQuotes, getShopServices } from "../../scripts/quotes";

import { useTable, useFilters, Column } from "react-table";
import SelectColumnFilter from "../common/tableFilters/selectfilter";
import DefaultColumnFilter from "../common/tableFilters/defaultfilter";

import QuoteShopDetailModal from "./quotesShopDetail";
import QuoteStatusBadge from "./quoteStatusBadge";
import { getAffliatedShop } from "../../scripts/shop";

// https://dev.to/onesignal/how-to-integrate-onesignal-into-a-next-js-app-1dmg
const QuotesShopContainer: FunctionComponent = () => {
    const router = useRouter();
    const ctx = useAppContext();

    let shop = {} as Shop;

    const [displayNewQuotes, setDisplayNewQuotes] = useState(false);
    const [displayServices, setDisplayServices] = useState(false);
    const [displayMoreInfo, setDisplayMoreInfo] = useState(false);
    const [displayRejection, setDisplayRejection] = useState(false);
    const [baseServices, setBaseServices] = useState<any[]>([]);
    const [shopData, setShopData] = useState(shop);
    const [shopQuotes, setShopQuotes] = useState([] as Quote[]);

    // -1 means unselected, if a quote is selected, show detail modal
    const [selectedQuoteIndex, setSelectedQuoteIndex] = useState(-1);

    // converts api quote list to table data
    const data = useMemo(
        () =>
            shopQuotes.map((quote) => ({
                id: quote.id,
                priority: quote.priority,
                status: quote.status,
                phone: quote.quote_request.customer.phone,
                customer: quote.quote_request.customer.first_name,
                vehicle: quote.quote_request.vehicle.make + " " + quote.quote_request.vehicle.model,
                new: quote.new
            })),
        [shopQuotes]
    );

    const columns = useMemo(
        () =>
            [
                {
                    Header: "ID",
                    accessor: "id", // accessor is the "key" in the data
                },
                {
                    Header: "Customer Name",
                    accessor: "customer", // accessor is the "key" in the data
                    Cell: (cell) => (<>{cell.value}
                        {cell.row.original.new ? (
                            <i className="ms-2 fa-solid fa-asterisk fa-beat text-warning align-self-center" title={cell.row.original.notification} />
                        ) : (
                            ""
                        )}
                    </>)
                },
                {
                    Header: "Phone",
                    accessor: "phone", // accessor is the "key" in the data
                },
                {
                    Header: "vehicle",
                    accessor: "vehicle",
                },
                {
                    Header: "Priority",
                    accessor: "priority",
                    Filter: SelectColumnFilter,
                },
                {
                    Header: "Status",
                    accessor: "status",
                    Cell: (cell) => <QuoteStatusBadge status={cell.value} />,
                    Filter: SelectColumnFilter,
                },
            ] as Column[],
        []
    );

    const defaultColumn = useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data, defaultColumn }, useFilters);

    const getShop = () => {
        getAffliatedShop(Number(ctx.user?.id), (result) => {
            setShopData(result.shop);
            getShopQuote(result.shop.id);
            getBaseServices(result.shop.id);
        });
    };

    const getBaseServices = (shopID: Number) => {
        getShopServices(shopID).then((result) => {
            setBaseServices(result.services);
        });
    };

    const getShopQuote = async (shopID: Number) => {
        const resp = await getShopQuotes(shopID);
        console.log(resp);
        setShopQuotes(resp);
        // need to be able to see quote request details
        // console.log(shopQuotes[2].quote_request.id);
    };

    const handleCloseDetailModal = () => {
        setSelectedQuoteIndex(-1);
        getShopQuote(shopData.id);
        // add refresh
    };

    // use PUT to update an existing quote or quote request

    useEffect(() => {
        if (ctx) {
            getShop();
        }
        if (router.query.quoteId) {
            shopQuotes.forEach((quote, i) => {
                if (quote.id === Number(router.query.quoteId)) {
                    setSelectedQuoteIndex(i);
                    return;
                }
            });
        }
    }, [ctx]);

    const sendCustomer = (event: any) => {
        event.preventDefault();
        setDisplayNewQuotes(false);
        setDisplayServices(false);
        setDisplayMoreInfo(false);
        setDisplayRejection(false);
    };

    return (
        <div>
            {selectedQuoteIndex >= 0 ? (
                <QuoteShopDetailModal handleClose={handleCloseDetailModal} quote={shopQuotes[selectedQuoteIndex]} baseServices={baseServices} />
            ) : (
                ""
            )}
            <h2 className="text-center mb-3 fst-italic"> {shopData.name?.toUpperCase() ?? ""}'S QUOTES</h2>
            <div>
                <Table hover striped className="shadow" {...getTableProps()}>
                    <thead>
                        {
                            // Loop over the header rows
                            headerGroups.map((headerGroup) => (
                                // Apply the header row props
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {
                                        // Loop over the headers in each row
                                        headerGroup.headers.map((column) => (
                                            // Apply the header cell props
                                            <th {...column.getHeaderProps()}>
                                                {
                                                    // Render the header
                                                    column.render("Header")
                                                }
                                                <div className={styles.columnFilters}>{column.canFilter ? column.render("Filter") : null}</div>
                                            </th>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </thead>
                    {/* Apply the table body props */}
                    <tbody {...getTableBodyProps()}>
                        {
                            // Loop over the table rows
                            rows.map((row) => {
                                // Prepare the row for display
                                prepareRow(row);
                                return (
                                    // Apply the row props
                                    <tr {...row.getRowProps()}>
                                        {
                                            // Loop over the rows cells
                                            row.cells.map((cell) => {
                                                // Apply the cell props
                                                return (
                                                    <td
                                                        style={{ cursor: "pointer" }}
                                                        {...cell.getCellProps()}
                                                        onClick={() => setSelectedQuoteIndex(row.index)}
                                                    >
                                                        {
                                                            // Render the cell contents
                                                            cell.render("Cell")
                                                        }
                                                    </td>
                                                );
                                            })
                                        }
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </Table>
            </div>

            {displayMoreInfo && (
                <div>
                    <Form.Control as="textarea" defaultValue="To: customer0_customer@example.com" rows={10} />
                    <Button className={styles.quoteAlign} onClick={sendCustomer}>
                        Send to Customer
                    </Button>
                </div>
            )}
            {displayServices && (
                <div>
                    <Table striped bordered hover variant="dark">
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Estimated Time</th>
                                <th>Add/Remove Service</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {services.services.map((service) => {
                            return (
                                <tr key={service.id}>
                                    <td>{service.name}</td>
                                    <td>{service.description}</td>
                                </tr>
                            )
                        })} */}
                        </tbody>
                    </Table>
                    <Button>Choose appointment time</Button>
                    <Button className={styles.quoteAlign} onClick={sendCustomer}>
                        Send to Customer
                    </Button>
                </div>
            )}
            {displayRejection && (
                <div>
                    <Form.Control as="textarea" placeholder="Enter a reason for rejection" rows={5} />
                    <Button className={styles.quoteAlign} onClick={sendCustomer}>
                        Send to Customer
                    </Button>
                </div>
            )}
        </div>
    );
};

export default QuotesShopContainer;
