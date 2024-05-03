/**
 * This is the functional component that handles the modification of a quote on the shop side of the application.
 */

import { FC, useState, useEffect, useMemo } from "react";
import { Modal, Form, Button, Nav, Spinner } from "react-bootstrap";
import path from "path";

import { useAppContext } from "../../context/state";
import QuoteStatusBadge from "./quoteStatusBadge";
import QuoteServiceCard from "./quoteService";
import { QuoteService, QuoteServiceLocal, imageFile, Dictionary } from "../../scripts/common";
import { createQuoteService, getQuote, deleteQuoteService, editQuoteService, updateQuote, sendQuoteNotice } from "../../scripts/quotes";
import ExpandableConversationContainer from "../messages/expandableConversationContainer";
import ImageContainer from "./imageContainer";


type Props = {
    handleClose: Function;
    quote: any;
    baseServices: any[];
};

const QuoteShopDetailModal: FC<Props> = ({ handleClose, quote, baseServices }) => {
    const [quoteServices, setQuoteServices] = useState<QuoteService[]>([]);
    const [quoteServicesLocal, setQuoteServicesLocal] = useState<QuoteServiceLocal[]>([]);
    const [newService, setNewService] = useState<QuoteServiceLocal | null>(null);
    const [quoteUpdated, setQuoteUpdated] = useState(quote);
    const [changed, setChanged] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [photos, setPhotos] = useState<Dictionary<imageFile>>({});

    // fetch quote services on component load
    useEffect(() => {
        getQuote(quote.id, (result) => {
            setQuoteUpdated(result.quote);
        });
    }, []);

    // initializes images

    useEffect(() => {
        const saved_photos: Dictionary<imageFile> = {};

        quote.quote_request.images.forEach((image: imageFile) => {
            saved_photos[path.basename(image.url)] = {
                id: image.id,
                url: process.env.NEXT_PUBLIC_API_URL + image.url,
                size: image.size,
            };
        });

        setPhotos(saved_photos);
    }, []);

    // update service list on quote change
    useEffect(() => {
        setQuoteServices(quoteUpdated.services);
        setQuoteServicesLocal(quoteUpdated.services);
    }, [quoteUpdated]);

    const totalPrice = useMemo(() => {
        let price = 0;
        quoteServicesLocal.forEach((service) => {
            if (service.change !== "delete") price += Number(service.price);
        });
        return price;
    }, [quoteServicesLocal]);

    const createNewService = () => {
        setNewService({ name: "", price: 0, description: "", est_time: "", comment: "", change: "new" });
    };

    const closeModal = () => {
        if (!changed || confirm(`You have unsaved changes in this quote, close without saving the changes?`)) handleClose();
    };

    const handleCreateService = (service: QuoteService) => {
        setNewService(null);
        setQuoteServicesLocal([service, ...quoteServicesLocal]);
        setChanged(true);
    };

    const handleEditService = (index: number, service: QuoteService) => {
        console.log(quoteServicesLocal);
        console.log(index);

        setQuoteServicesLocal((current_services) => {
            const new_services = [...current_services];
            new_services[index] = { ...new_services[index], ...service };
            return new_services;
        });
        setChanged(true);
    };

    const handleDeleteService = (index: number) => {
        if (confirm(`Confirm deletion of "${quoteServicesLocal[index].name}"?`)) {
            setQuoteServicesLocal((current_services) => {
                const new_services = [...current_services];
                if (new_services[index].change === "new") new_services.splice(index, 1);
                else {
                    new_services[index].change = "delete";
                }
                return new_services;
            });
            setChanged(true);
        }
    };

    const handleUpdatePriority = (e: any) => {
        updateQuote(quote.id, { priority: e.target.value }, (result) => {
            setQuoteUpdated(result.quote);
        });
    };

    const setStatus = (status: string) => {
        updateQuote(quote.id, { status: status }, (result) => {
            setQuoteUpdated(result.quote);
        });
    };

    const revert = () => {
        const original_services = [...quoteServices] as QuoteServiceLocal[];
        original_services.forEach((service) => {
            service.change = undefined;
        });
        setQuoteServicesLocal(original_services);
        setChanged(false);
    };

    const handleApplyChanges = () => {
        setSubmitting(true);
        const promises: Promise<Number>[] = [];
        quoteServicesLocal.forEach((service) => {
            if (service.change === "new") promises.push(createQuoteService(quote.id, service));
            else if (service.change === "edit") promises.push(editQuoteService(quote.id, service));
            else if (service.change === "delete") promises.push(deleteQuoteService(quote.id, Number(service.id)));
        });
        Promise.all(promises).then((results) => {
            sendQuoteNotice(quote.id, (result) => {
                console.log(result)
            });

            getQuote(quote.id, (result) => {
                setQuoteUpdated(result.quote);
                setChanged(false);
                setSubmitting(false);
            });
        });
    };

    return (
        <Modal scrollable size="xl" show onHide={closeModal} className="text-dark">
            <Modal.Header className="py-1 bg-light fw-bold" closeButton>
                <div>Quote #{quote.id}</div>
                <div className="ms-4">
                    Total: <span className="text-success">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="ms-3">
                    <QuoteStatusBadge status={quoteUpdated.status} />
                </div>
                <Nav className="flex-fill justify-content-end h6">
                    <Nav.Item>
                        <Nav.Link href="#customer-section">Customer</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="#vehicle-section">Vehicle</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="#details-section">Details</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="#services-section">Services</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Modal.Header>
            {changed ? (
                <div className="bg-secondary text-light text-end py-1">
                    <span className="me-2 fw-normal">
                        {submitting ? (
                            <>
                                <Spinner animation="border" size="sm" />
                                Updating quote...
                            </>
                        ) : (
                            "You have unsaved changes. Apply updates to the request?"
                        )}
                    </span>
                    <Button variant="success" size="sm" className="mx-1 px-4 border-light" onClick={handleApplyChanges}>
                        Apply
                    </Button>
                    <Button variant="outline-light" size="sm" className="mx-1 border-light" onClick={revert}>
                        Revert
                    </Button>
                </div>
            ) : (
                ""
            )}
            <Modal.Body>
                <div>
                    Requested on: <span>{new Date(quote.quote_request.created_at).toLocaleString()}</span>
                </div>
                <Form>
                    <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border" id="customer-section">
                        <h5>Customer</h5>
                        <Form.Label>Name</Form.Label>
                        <div className="border rounded p-2 bg-white">
                            {quoteUpdated.quote_request.customer.first_name + " " + quoteUpdated.quote_request.customer.last_name}
                        </div>

                        <div className="d-flex">
                            <div className="flex-fill me-2">
                                <Form.Label className="mt-2">Phone</Form.Label>
                                <div className="border rounded p-2 bg-white">{quoteUpdated.quote_request.customer.phone}</div>
                            </div>
                            <div className="flex-fill">
                                <Form.Label className="mt-2">Email</Form.Label>
                                <div className="border rounded p-2 bg-white">{quoteUpdated.quote_request.customer.email}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border" id="vehicle-section">
                        <h5>Vehicle</h5>
                        <Form.Label className="mt-2">Year / Make / Model</Form.Label>
                        <div className="border rounded p-2 bg-white">
                            {quoteUpdated.quote_request.vehicle.year +
                                " " +
                                quoteUpdated.quote_request.vehicle.make +
                                " " +
                                quoteUpdated.quote_request.vehicle.model}
                        </div>
                        <div className="d-flex">
                            <div className="flex-fill me-2">
                                <Form.Label className="mt-2">Plate</Form.Label>
                                <div className="border rounded p-2 bg-white">{quoteUpdated.quote_request.vehicle.plate_number}</div>
                            </div>
                            <div className="flex-fill">
                                <Form.Label className="mt-2">VIN</Form.Label>
                                <div className="border rounded p-2 bg-white">{quoteUpdated.quote_request.vehicle.vin}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border" id="details-section">
                        <h5>Details</h5>
                        <Form.Label className="mt-2">Description</Form.Label>
                        <div className="border rounded p-2 bg-white">{quoteUpdated.quote_request.description}</div>

                        <Form.Label className="mt-2">Attached Images</Form.Label>
                        <div className="border rounded p-2 bg-white fw-normal">
                            {Object.keys(photos).length > 0 ? <ImageContainer photos={photos} /> : "N/A"}
                        </div>

                        <Form.Label className="mt-2">Part Preference</Form.Label>
                        <div className="border rounded p-2 bg-white">{quoteUpdated.quote_request.part_preference}</div>

                        <Form.Label className="mt-2">Preferred Date / Time</Form.Label>
                        <div className="border rounded p-2 bg-white">{quoteUpdated.quote_request.availability}</div>
                    </div>

                    <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border">
                        <div className="d-flex">
                            <h5>Response</h5>
                            {/* accept reject buttons, hidden for shop side */}
                            {/* <div className="ms-auto">
                                <Button
                                    size="sm"
                                    className="flex-fill me-1"
                                    variant="success"
                                    disabled={quoteUpdated.status === "booked"}
                                    onClick={() => setStatus("booked")}
                                >
                                    Book
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-fill ms-1"
                                    variant="danger"
                                    disabled={quoteUpdated.status === "canceled"}
                                    onClick={() => setStatus("canceled")}
                                >
                                    Reject
                                </Button>
                            </div> */}
                        </div>

                        <div className="mt-2">
                            <Form.Label className="me-2">Current Status: </Form.Label>
                            <QuoteStatusBadge status={quoteUpdated.status} />
                            <br />

                            <div className="d-flex">
                                <Form.Label className="align-self-center align-middle">Priority: </Form.Label>
                                <Form.Select className="ms-3" value={quoteUpdated.priority} onChange={(e) => handleUpdatePriority(e)}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </Form.Select>
                            </div>
                        </div>

                        <Form.Label className="mt-2 d-flex justify-content-between" id="services-section">
                            Services{" "}
                            <span>
                                <span className="text-primary fw-bold">{quoteServicesLocal.length}</span> service(s)
                            </span>
                            <span>
                                Total: $<span className="text-primary fw-bold">{totalPrice.toFixed(2)}</span>
                            </span>
                        </Form.Label>
                        <div className="border rounded p-2 bg-white">
                            <Button variant="outline-success" disabled={newService !== null} className="w-100" onClick={createNewService}>
                                Add Service
                            </Button>
                            {newService ? (
                                <QuoteServiceCard
                                    isNew={true}
                                    id="newService"
                                    className="mt-2 outline"
                                    service={newService}
                                    baseServices={baseServices}
                                    handleCreateService={handleCreateService}
                                    serviceIndex={-1}
                                    handleSetNewService={setNewService}
                                    startExpanded={true}
                                />
                            ) : (
                                ""
                            )}
                            {quoteServicesLocal
                                .map((service, i) =>
                                    service.change !== "delete" ? (
                                        <QuoteServiceCard
                                            key={`service-${i}`}
                                            isNew={false}
                                            className="mt-1"
                                            service={service}
                                            baseServices={baseServices}
                                            handleEditService={handleEditService}
                                            serviceIndex={i}
                                            handleDeleteService={handleDeleteService}
                                        />
                                    ) : (
                                        ""
                                    )
                                )
                                .reverse()}
                        </div>
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer bsPrefix="detailed-quote-footer">
                <ExpandableConversationContainer convId={quote.comments} className="" />
            </Modal.Footer>
        </Modal>
    );
};

export default QuoteShopDetailModal;
