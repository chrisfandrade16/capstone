/**
 * A component to configure the display for the conversation that can occur between a customer and a shop.
 */

import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { Conversation, Message } from "../../scripts/conversation";
import styles from "../../styles/Chat.module.css";

interface ConversationProps {
    conversation: Conversation;
    handleDelete: Function;
    handleEdit: Function;
    handleRead: Function;
    className?: string;
}

const ConversationDisplay = ({ conversation, handleDelete, handleEdit, handleRead, className }: ConversationProps) => {
    const [editing, setEditing] = useState(-1);
    const [newMessage, setNewMessage] = useState("");

    const getFootnote = (message: Message) => {
        let timeLabel = "";
        if (message.deleted_at) timeLabel = `deleted on ${message.deleted_at.toLocaleString()}`;
        else if (message.editted_at) {
            timeLabel = `modified on ${message.editted_at.toLocaleString()}`;
        } else timeLabel = message.created_at.toLocaleString();
        return (
            <div className="text-secondary mt-1 text-end" style={{ fontSize: "0.75em" }}>
                {timeLabel}
            </div>
        );
    };

    const getFullAuthorName = (username: string) => {
        const user = conversation.participants[username];
        return user.first_name + " " + user.last_name;
    };

    return (
        <div className={className} onClick={handleRead}>
            {conversation.messages.map((message: Message, i: number) => (
                <div key={`msg-${i}`}>
                    {message.author ? (
                        <div className={styles.chatCard}>
                            <div
                                className={"fw-bold w-100 text-muted" + (message.isMine ? " text-end" : "")}
                                title={conversation.participants[message.author].email}
                            >
                                <i className="fa-solid fa-user" /> {getFullAuthorName(message.author) + (message.isMine ? " (you)" : "")}:
                            </div>
                            <Card
                                className={
                                    (message.isMine ? styles.chatMine : styles.chatOthers) +
                                    " mb-2 bg-opacity-10 " +
                                    (message.isNew ? styles.chatNew : "")
                                }
                            >
                                <Card.Body className="py-1">
                                    {/* message body display */}
                                    {editing == message.id ? (
                                        // this post is being editted
                                        <Form>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                value={newMessage}
                                                onChange={(e) => {
                                                    setNewMessage(e.target.value);
                                                }}
                                            />
                                        </Form>
                                    ) : (
                                        // this post is not being editted
                                        <>
                                            <div style={{ whiteSpace: "pre" }}>
                                                {message.deleted_at ? (
                                                    <span className="text-danger">This message has been deleted by its author.</span>
                                                ) : (
                                                    message.message
                                                )}
                                            </div>
                                            {getFootnote(message)}
                                        </>
                                    )}
                                </Card.Body>
                                {message.isMine && !message.deleted_at ? (
                                    <div className={styles.chatEditPanel + " me-1 mb-1"}>
                                        {editing == message.id ? (
                                            // editing
                                            <>
                                                {/* confirm edit button */}
                                                <Button
                                                    className="my-0 me-1 px-1 py-0"
                                                    size="sm"
                                                    variant="success"
                                                    title="Confirm"
                                                    onClick={() => {
                                                        handleEdit(message.id, newMessage);
                                                        setEditing(-1);
                                                        setNewMessage("");
                                                    }}
                                                >
                                                    <i className="fa-solid fa-check" />
                                                </Button>
                                                <Button
                                                    className="my-0 px-1 py-0"
                                                    size="sm"
                                                    variant="secondary"
                                                    title="Cancel"
                                                    onClick={() => {
                                                        setEditing(-1);
                                                        setNewMessage("");
                                                    }}
                                                >
                                                    <i className="fa-solid fa-xmark" />
                                                </Button>
                                            </>
                                        ) : (
                                            // not in editing mode
                                            <>
                                                {/* edit button */}
                                                <Button
                                                    className="my-0 me-1 px-1 py-0"
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    title="Edit"
                                                    onClick={() => {
                                                        setNewMessage(message.message);
                                                        setEditing(message.id);
                                                    }}
                                                >
                                                    <i className="fa-solid fa-pen" />
                                                </Button>
                                                {/* delete button */}
                                                <Button
                                                    className="my-0 px-1 py-0"
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    title="Delete"
                                                    onClick={() => {
                                                        handleDelete(message.id);
                                                    }}
                                                >
                                                    <i className="fa-solid fa-trash" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    ""
                                )}
                            </Card>
                        </div>
                    ) : (
                        <div className="w-100 text-center my-2 fw-normal text-primary">
                            <span className="me-1 text-muted" style={{ fontSize: "0.75em" }}>
                                ({message.created_at.toLocaleString()})
                            </span>{" "}
                            {message.message}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ConversationDisplay;
