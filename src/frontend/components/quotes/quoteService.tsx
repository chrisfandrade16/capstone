/**
 * This functional component handles the service section of a quote on the shop side of the application.
 * Allows the shop to add/remove/edit services as necessary for a quote to a customer.
 */

import { useMemo, FC, useState, useRef, useEffect } from "react";
import { Card, Form, Button, Row, Col, Collapse } from "react-bootstrap";
import Select from "react-select";
import { QuoteServiceLocal } from "../../scripts/common";

type Props = {
    service: QuoteServiceLocal;
    baseServices: any[];
    serviceIndex: number;
    className?: string;
    id?: string | undefined;
    isNew?: boolean;
    handleSetNewService?: Function | undefined;
    handleEditService?: Function | undefined;
    handleCreateService?: Function | undefined;
    handleDeleteService?: Function | undefined;
    startExpanded?: boolean;
};

const QuoteServiceCard: FC<Props> = ({
    service,
    baseServices,
    handleEditService,
    handleSetNewService,
    handleCreateService,
    handleDeleteService,
    serviceIndex,
    className,
    id,
    isNew,
    startExpanded,
}) => {
    const options = useMemo(() => baseServices.map((baseService, i) => ({ label: baseService.name, value: i + 1 })), []);

    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState("0.00");
    const [duration, setDuration] = useState("");
    const [comment, setComment] = useState("");
    const [expanded, setExpanded] = useState(startExpanded);

    const [editing, setEditing] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    const init = () => {
        setName(service.name ?? "");
        setDesc(service.description ?? "");
        setPrice(service.price?.toString() ?? "");
        setDuration(service.est_time ?? "");
        setComment(service.comment ?? "");
    };

    const applyTemplate = (rowIndex: number) => {
        setName(baseServices[rowIndex].name);
        setDesc(baseServices[rowIndex].description);
        setPrice(baseServices[rowIndex].price);
        setDuration(baseServices[rowIndex].est_time);
    };

    const cancelEdit = () => {
        if (isNew && handleSetNewService) handleSetNewService(null);
        else {
            init();
            setEditing(false);
            setExpanded(false);
        }
    };

    const applyEdit = () => {
        setEditing(false);
        if (isNew && handleCreateService) {
            handleCreateService({
                name: name,
                description: desc,
                est_time: duration,
                price: price,
                comment: comment,
                change: "new",
            });
        } else if (handleEditService) {
            handleEditService(serviceIndex, {
                name: name,
                description: desc,
                est_time: duration,
                price: price,
                comment: comment,
                change: service.change !== "new" ? "edit" : "new",
            });
        }
        setExpanded(false);
    };

    useEffect(() => {
        init();
        if (isNew) {
            setEditing(true);
            // setExpanded(true);
            if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [service]);

    return (
        <Card className={className} id={id}>
            <Card.Header className="d-flex p-1">
                <>
                    <i
                        style={{ cursor: "pointer" }}
                        className={`fa-solid fa-chevron-${expanded ? "up" : "down"} text-secondary mx-2 align-self-center`}
                        onClick={() => setExpanded((current) => !current)}
                    />
                    {editing ? (
                        <Select
                            className="flex-fill me-4"
                            isDisabled={!editing}
                            options={options}
                            placeholder="Select Service Template"
                            onChange={(option: any) => {
                                if (option.value > 0) {
                                    applyTemplate(option.value - 1);
                                }
                            }}
                        />
                    ) : (
                        <>
                            <h6 className="align-self-center m-0">{service.name}</h6>
                        </>
                    )}
                    <h6 className="align-self-center my-0 ms-auto me-3">${service.price}</h6>
                    {/* button panel to control edit mode */}
                    <div className="quote-service-controls align-self-center">
                        {editing ? (
                            <>
                                <Button size="sm" disabled={name.trim() === ""} variant="success me-2" onClick={applyEdit}>
                                    <i className="fa-solid fa-check" />
                                </Button>
                                <Button size="sm" variant="secondary" onClick={cancelEdit}>
                                    <i className="fa-solid fa-xmark" />
                                </Button>
                            </>
                        ) : (
                            <>
                                {handleEditService ? (
                                    <Button
                                        size="sm"
                                        variant="outline-secondary me-2"
                                        onClick={() => {
                                            setEditing(true);
                                            setExpanded(true);
                                        }}
                                        title="Edit"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </Button>
                                ) : (
                                    ""
                                )}
                                {handleDeleteService ? (
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => {
                                            if (handleDeleteService) handleDeleteService(serviceIndex);
                                        }}
                                        title="Delete"
                                    >
                                        <i className="fa-solid fa-trash" />
                                    </Button>
                                ) : (
                                    ""
                                )}
                            </>
                        )}
                    </div>
                </>
            </Card.Header>
            <Collapse in={expanded}>
                <Card.Body className="p-1">
                    <fieldset disabled={!editing}>
                        <Row>
                            <Col>
                                Name:{" "}
                                <Form.Control
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }}
                                    value={name}
                                />
                            </Col>
                            <Col>
                                Description{" "}
                                <Form.Control
                                    onChange={(e) => {
                                        setDesc(e.target.value);
                                    }}
                                    value={desc}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                Est. Time:{" "}
                                <Form.Control
                                    onChange={(e) => {
                                        setDuration(e.target.value);
                                    }}
                                    value={duration}
                                />
                            </Col>
                            <Col>
                                Price ($):{" "}
                                <Form.Control
                                    onChange={(e) => {
                                        setPrice(e.target.value);
                                    }}
                                    onBlur={() => {
                                        setPrice((old) => Number(old.replace(/[^\d.-]/g, "")).toFixed(2));
                                    }}
                                    value={price}
                                />
                            </Col>
                        </Row>
                        Additional Notes:{" "}
                        <Form.Control
                            onChange={(e) => {
                                setComment(e.target.value);
                            }}
                            value={comment}
                        />
                    </fieldset>
                </Card.Body>
            </Collapse>
            <i ref={bottomRef} />
        </Card>
    );
};

export default QuoteServiceCard;
