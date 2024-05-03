/**
 * This is the functional component that displays the customer's history of quote requests in a table format.
 */

import React, { FunctionComponent, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Button, Table, Modal } from "react-bootstrap";
import { useTable, useFilters, useExpanded } from "react-table";

import styles from "../../styles/Quotes.module.css";
import { useAppContext } from "../../context/state";
import { QuoteRequest } from "../../components/types";
import DefaultColumnFilter from "../common/tableFilters/defaultfilter";
import DeleteConfirmation from "./quoteRequestDeleteConfirm";

import QuoteRequestStatusDetailModal from "./quoteRequestStatusDetail";
import { getUserQuoteRequests } from "../../scripts/quotes";
import { QuoteService } from "../../scripts/common";
import QuoteRequestModifyModal from "./quoteRequestModifyDetails";
import QuoteStatusBadge from "./quoteStatusBadge";

import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-datepicker/dist/react-datepicker.css";

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

const QuotesCustomerContainer: FunctionComponent = () => {
    const router = useRouter();
    const ctx = useAppContext();

    const handleQuoteRedirect = (e) => {
        console.log("Creating new quote request");
        router.push("/quotes/new");
    };

    const [deleteTableIndex, setDeleteTableIndex] = useState(Number);
    const [displayConfirmationModal, setDisplayConfirmationModal] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");

    const showDeleteModal = (event: React.MouseEvent<SVGSVGElement, MouseEvent>, row) => {
        event.stopPropagation();
        setDeleteTableIndex(row.index);

        setDeleteMessage(
            "Are you sure you want to delete this quote request? Please note it will also be deleted from any shops you have sent it to."
        );
        setDisplayConfirmationModal(true);
    };

    const [tableIndex, setTableIndex] = useState(Number);

    const handleModify = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, row) => {
        router.push(`/quotes/${row.values.id}/modify`);
    };

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: Number) => {
        deleteQuoteRequest(Number(id));
    };

    const deleteQuoteRequest = async (quoteID: Number) => {
        console.log(quoteID);
        console.log(deleteTableIndex);
        let error = false;
        await fetch(API_HOST_URL + `/quote/request/${quoteRequestData[deleteTableIndex].id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    error = true;
                    console.error(response);
                }
                console.log(response);
                handleGetQuoteRequests();
                return response.json();
            })
            .then((result) => {
                if (error) {
                    console.error(result);
                } else {
                    //onSuccessCallback(result);
                }
            });
        hideConfirmationModal();
    };

    const hideConfirmationModal = () => {
        setDisplayConfirmationModal(false);
    };

    const [quoteId, setQuoteId] = useState(-1);
    const [loading, setLoading] = useState(false);

    // Existing quote request data
    const [quoteRequestData, setQuoteRequestData] = useState([] as QuoteRequest[]);

    // get quote request and populate associated quotes
    const handleGetQuoteRequests = () => {
        if (ctx.user) {
            setLoading(true);
            getUserQuoteRequests(ctx.user.id, (result) => {
                setQuoteRequestData(result);
                setLoading(false);
            });
        }
    };

    useEffect(() => {
        if (ctx.user) {
            handleGetQuoteRequests();
            if (router.query?.quoteId) setQuoteId(Number(router.query.quoteId));
        }
    }, [ctx]);

    const handleClose = () => {
        setModalShow(false);
        handleGetQuoteRequests();
    };

    const [modalShow, setModalShow] = useState(false);

    const handleCloseStatusModal = () => {
        setQuoteId(-1);
        setSelectedQuoteRequestTableIndex(-1);
        handleGetQuoteRequests();
        // add refresh
    };

    const [selectedQuoteRequestTableIndex, setSelectedQuoteRequestTableIndex] = useState(-1);

    // TABLE SETTINGS ********************************************************************
    const columns = useMemo(
        () => [
            {
                Header: "ID",
                accessor: "id",
                className: styles.idColumn,
            },
            {
                Header: "Description",
                accessor: "description",
            },
            {
                accessor: "shop",
                Header: "Shops",
                Cell: (cell) =>
                    cell.row.depth === 1 ? (
                        <div className="d-flex py-1">
                            <i className="fa-solid fa-shop ms-3 me-2 text-secondary align-self-center" />
                            <span className="d-inline-block overflow-hidden text-truncate">{cell.value}</span>
                            {cell.row.original.notification ? (
                                <i
                                    className="ms-2 fa-solid fa-asterisk fa-beat text-danger align-self-center"
                                    title={cell.row.original.notification}
                                />
                            ) : (
                                ""
                            )}
                        </div>
                    ) : (
                        <div
                            className="py-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpanded(cell.row.id);
                            }}
                        >
                            <span>
                                <i className={`fa-solid ${cell.row.isExpanded ? "fa-minus" : "fa-caret-down"} pe-2 text-primary`} />
                            </span>
                            <span title={cell.value}>{cell.row.subRows.length} shop(s)</span>
                            {cell.row.original.notification ? (
                                <i
                                    className="ms-2 fa-solid fa-asterisk fa-beat text-danger align-self-center"
                                    title={`${cell.row.original.notification} new notifications`}
                                />
                            ) : (
                                ""
                            )}
                        </div>
                    ),
            },
            {
                Header: "Status",
                Filter: "",
                Cell: (cell) => (cell.row.depth === 1 ? <QuoteStatusBadge status={cell.row.original.status ?? ""} /> : ""),
            },
            {
                Header: "",
                accessor: "delete",
                Filter: "",
                Cell: (cell) => (cell.row.depth === 0 ? <FontAwesomeIcon icon={faTrash} onClick={(e) => showDeleteModal(e, cell.row)} /> : ""),
            },
        ],
        [quoteRequestData]
    );

    const defaultColumn = useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    );

    const getServiceTotalPrice = (services: QuoteService[]) => {
        let total = 0;
        services.forEach((service) => {
            total += Number(service.price);
        });
        return total;
    };

    const data = useMemo(() => {
        console.log(quoteRequestData);
        const new_data = quoteRequestData.map((req) => ({
            id: req.id,
            description: req.description,
            part_preferences: req.part_preference,
            // shop: req.quotes.length + " shop(s)",
            shop: req.quote_set.map((quote) => quote.shop.name).join(),
            subRows: req.quote_set.map((quote) => ({
                id: quote.id,
                shop: quote.shop.name,
                status: quote.status,
                description: quote.services.length > 0 ? "Est. Total: $" + getServiceTotalPrice(quote.services) : "Awaiting Shop Response...",
                notification: quote.notification,
            })),
            notification: req.quote_set.filter((quote) => quote.notification !== "").length,
        }));
        console.log(new_data);
        return new_data;
    }, [quoteRequestData]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, toggleRowExpanded } = useTable(
        { columns, data, defaultColumn, autoResetExpanded: false },
        useFilters,
        useExpanded
    );

    return (
        <div>
            <DeleteConfirmation
                showModal={displayConfirmationModal}
                confirmModal={handleDelete}
                hideModal={hideConfirmationModal}
                message={deleteMessage}
                id={deleteTableIndex}
            />
            {quoteId >= 0 ? <QuoteRequestStatusDetailModal handleClose={handleCloseStatusModal} quoteIDs={quoteId} /> : ""}
            <h2 className="text-center mb-3 fst-italic">YOUR QUOTE REQUESTS</h2>
            <div>
                <Modal show={loading} backdrop="static" keyboard={false}>
                    <Modal.Body>
                        <div className="text-center my-2">
                            <h1 className="text-muted">
                                <i className="fa-solid fa-car-side fa-bounce text-primary" /> Loading...
                            </h1>
                        </div>
                    </Modal.Body>
                </Modal>
                <div>
                    <Table className="shadow" hover size="sm" {...getTableProps()}>
                        <thead>
                            {headerGroups.map((headerGroup) => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map((column) => (
                                        <th className="align-top" {...column.getHeaderProps()}>
                                            {column.render("Header")}
                                            <div className={styles.columnFilters}>{column.canFilter ? column.render("Filter") : null}</div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map((row, i) => {
                                prepareRow(row);
                                return (
                                    <tr
                                        {...row.getRowProps()}
                                        style={{ cursor: "pointer" }}
                                        className={row.depth === 1 ? "bg-secondary bg-opacity-25" : ""}
                                        onClick={(e) => {
                                            if (row.depth === 0) {
                                                handleModify(e, row);
                                            } else {
                                                setQuoteId(row.values.id);
                                            }
                                        }}
                                    >
                                        {row.cells.map((cell) => {
                                            return (
                                                <td className={cell.column.className} {...cell.getCellProps()}>
                                                    {cell.render("Cell")}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                    {modalShow && <QuoteRequestModifyModal handleClose={handleClose} quoteRequest={quoteRequestData[tableIndex]} />}
                    <Button onClick={(e) => handleQuoteRedirect(e)} variant="primary w-100" className="" type="submit">
                        <i className="fa-regular fa-file me-2" />
                        Create New Quote Request
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QuotesCustomerContainer;
