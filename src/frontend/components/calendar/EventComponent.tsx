/**
 * Event component for the calendar feature of the application
 */

import React from "react";
import { EventDef } from "react-big-calendar";
import { Button, ButtonGroup, Card, Modal, Form } from "react-bootstrap";

interface EventComponentProps {
    event: EventDef;
    resourceId?: string;
    onEdit?: (event: EventDef) => void;
    onDelete?: (event: EventDef) => void;
}

const EventComponent: React.FC<EventComponentProps> = ({ event, resourceId, onDelete, onEdit }) => {
    const [showModal, setShowModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const { title, start, end } = event;

    const handleEdit = () => {
        if (onEdit) {
            onEdit(event);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(event);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    const getBG = (title: string) => {
        if (title === "Free Slot") {
            return "#31ad3e"
        }
        if (title === "Reserved") {
            return "#ad3e31"
        }

    };

    return (
        <>
            <Card className={"mb-3 text-black"} style={{ backgroundColor: getBG(event.title) }}>
                <Card.Header>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{event.title}</span>
                        <ButtonGroup>
                            <Button variant="primary tw-text-xs m-0 p-2" onClick={() => setShowEditModal(true)}>
                                <i className="fa fa-pencil" />
                            </Button>
                            <Button variant="danger tw-text-xs m-0 p-2" onClick={() => setShowModal(true)}>
                                <i className="fa fa-trash" />
                            </Button>
                        </ButtonGroup>
                    </div>
                </Card.Header>
                <Card.Body>
                    <div>
                        {/* <span>Start: {event.start.toLocaleString()}</span>
            <span>End: {event.end.toLocaleString()}</span> */}
                        {resourceId && <span>Resource ID: {resourceId}</span>}
                    </div>
                </Card.Body>
            </Card>
            <Modal show={showModal} onHide={handleCloseModal} className={"text-black"}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Event</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this event? This action cannot be undone.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEditModal} onHide={handleCloseEditModal} className={"text-black"}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Event</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formStart">
                            <Form.Label>Start</Form.Label>
                            <Form.Control type="datetime-local" defaultValue={new Date(start).toISOString().substring(0, 16)} />
                        </Form.Group>
                        <Form.Group controlId="formEnd">
                            <Form.Label>End</Form.Label>
                            <Form.Control type="datetime-local" defaultValue={new Date(end).toISOString().substring(0, 16)} />
                        </Form.Group>
                        <Form.Group controlId="formTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" defaultValue={title} />
                        </Form.Group>
                        <Form.Group controlId="formResourceId">
                            <Form.Label>Resource Id</Form.Label>
                            <Form.Control type="text" defaultValue={resourceId} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleEdit}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default EventComponent;