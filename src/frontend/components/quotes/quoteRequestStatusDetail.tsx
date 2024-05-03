/**
 * A function component that returns a modal displaying the editable status detail of a quote request on the user side of the application.
 */

import { FC, useState, useEffect, useMemo } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import QuoteStatusBadge from "./quoteStatusBadge";
import ExpandableConversationContainer from "../messages/expandableConversationContainer";
import QuoteServiceCard from "./quoteService";

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

type Props = {
    handleClose: Function;
    quoteIDs: Number;
}

const QuoteRequestStatusDetailModal: FC<Props> = ({ handleClose, quoteIDs }) => {

    const [relatedShopIDs, setRelatedShopIDs] = useState(quoteIDs);
    const [relatedShopQuotes, setRelatedShopQuotes] = useState();
    const [quoteServices, setQuoteServices] = useState<QuoteService[]>([]);

    const getRelatedShopQuotes = async () => {
        const resp = await fetch(API_HOST_URL + `/quote/${relatedShopIDs}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${localStorage.getItem("accessToken")}`,
            }
        });
        console.log(resp);
        const result = await resp.json();
        setRelatedShopQuotes(result.quote);
        console.log(result.quote.shop);
        console.log(result.quote);
        setQuoteServices(result.quote.services);
    }

    const totalPrice = useMemo(() => {
        let price = 0;
        quoteServices.forEach((service) => {
            price += Number(service.price);
        });
        return price;
    }, [quoteServices]);

    const setStatus = async (status: string) => {
        let error = false;
        await fetch(API_HOST_URL + `/quote/${relatedShopIDs}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify({
                status: status
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    error = true;
                    console.log("error");
                }
                console.log(response);
                getRelatedShopQuotes();
                return response.json
            })
            .then((result) => {
                if (error) {
                    console.error(result);
                }
                console.log(result);
            })
    }

    useEffect(() => {
        // getRelatedShopQuotes(quoteIDs, (result) => {
        //     setRelatedShopQuotes(result);
        // });
        getRelatedShopQuotes();
    }, []);

    useEffect(() => {
        console.log("related shop quotes");
        console.log(relatedShopQuotes);

    }, [relatedShopQuotes])



    const closeModal = () => {
        handleClose();
    };

    return (
        <>
            {relatedShopQuotes ? (
                <Modal scrollable size="xl" show onHide={closeModal} className="text-dark">
                    <Modal.Header className="py-1 bg-light fw-bold" closeButton>
                        <div className="ms-4">
                            Quote Estimate: <span className="text-success">${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="ms-4">
                            <QuoteStatusBadge status={relatedShopQuotes.status} />
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border">
                                <h5>Shop</h5>
                                <Form.Label>Name</Form.Label>
                                <div className="border rounded p-2 bg-white">{relatedShopQuotes.shop.name}</div>

                                {/* <div className="d-flex">
                                    <div className="flex-fill me-2">
                                        <Form.Label className="mt-2">Phone</Form.Label>
                                        <div className="border rounded p-2 bg-white">{relatedShopQuotes.shop.phone}</div>
                                    </div>
                                    <div className="flex-fill">
                                        <Form.Label className="mt-2">Email</Form.Label>
                                        <div className="border rounded p-2 bg-white">{relatedShopQuotes.shop.email}</div>
                                    </div>
                                </div> */}
                            </div>

                            <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border">
                                <div className="d-flex">
                                    <h5>Response</h5>
                                    <div className="ms-auto">
                                        <Button
                                            size="sm"
                                            className="flex-fill me-1"
                                            variant="success"
                                            disabled={
                                                relatedShopQuotes.status === "booked" ||
                                                relatedShopQuotes.status === "canceled" ||
                                                relatedShopQuotes.services.length === 0
                                            }
                                            onClick={() => setStatus("booked")}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-fill ms-1"
                                            variant="danger"
                                            disabled={relatedShopQuotes.status === "canceled" || relatedShopQuotes.status === "booked"}
                                            onClick={() => setStatus("canceled")}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <Form.Label className="me-2">Current Status: </Form.Label>
                                    <QuoteStatusBadge status={relatedShopQuotes.status} />
                                    <br />
                                </div>

                                <Form.Label className="mt-2 d-flex justify-content-between">
                                    Services{" "}
                                    <span>
                                        <span className="text-primary fw-bold">{relatedShopQuotes.services.length}</span> service(s) added
                                    </span>
                                    <span>
                                        Total: $<span className="text-primary fw-bold">{totalPrice.toFixed(2)}</span>
                                    </span>
                                </Form.Label>
                                <div className="border rounded p-2 bg-white">
                                    {quoteServices
                                        .map((service, i) => (
                                            <QuoteServiceCard
                                                key={i}
                                                isNew={false}
                                                className="mt-1"
                                                service={service}
                                                baseServices={relatedShopQuotes.services}
                                                serviceIndex={i}
                                            />
                                        ))
                                        .reverse()}
                                </div>
                            </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer bsPrefix="detailed-quote-footer">
                        <ExpandableConversationContainer convId={relatedShopQuotes.comments} className="" />
                    </Modal.Footer>
                </Modal>
            ) : (
                ""
            )}
        </>
    );
};

export default QuoteRequestStatusDetailModal;