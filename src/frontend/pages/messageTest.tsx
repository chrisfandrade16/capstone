/**
 * Test component used for the messaging feature of the application
 */

import { useState } from "react";
import Button from "react-bootstrap/Button";
import { Form, Spinner } from "react-bootstrap";
import { useAppContext } from "../context/state";
import { getConversation, sendMessage, deleteMessage, editMessage, setEmailNotify, Conversation } from "../scripts/conversation";
import ConversationDisplay from "../components/messages/conversationDisplay";

const MessageTest = () => {
    const ctx = useAppContext();

    const [convId, setConvId] = useState("");
    const [conversation, setConversation] = useState<Conversation | undefined>(undefined);
    const [emailsub, setEmailsub] = useState(false);
    const [newMessage, setNewMessage] = useState("");

    const [uploading, setUploading] = useState(false);

    const handleRetrieve = () => {
        getConversation(ctx, parseInt(convId), (result: Conversation) => {
            setConversation(result);
            setEmailsub(result.emailSubscribed);
        });
    };

    const handleReply = () => {
        setUploading(true);
        sendMessage(
            ctx,
            parseInt(convId),
            newMessage,
            () => {
                handleRetrieve();
                setUploading(false);
                setNewMessage("");
            },
            () => {
                setUploading(false);
            }
        );
    };

    const handleDelete = (msgId: number) => {
        if (confirm("Confirm message deletion?")) {
            deleteMessage(ctx, msgId, handleRetrieve);
        }
    };

    const handleEdit = (msgId: number, message: string) => {
        editMessage(ctx, msgId, message, handleRetrieve);
    };

    const handleSetEmailNotify = (e: React.FocusEvent<HTMLInputElement>) => {
        setUploading(true);
        setEmailNotify(
            ctx,
            conversation?.id ?? -1,
            e.target.checked,
            (result: any) => {
                setEmailsub(result.enabled);
                setUploading(false);
            },
            () => {
                setUploading(false);
            }
        );
    };

    return (
        <div className="mt-3 p-4 rounded shadow message-container container bg-white">
            {/* get conversation container, replace this with known conversation ID in quote page */}
            <Form>
                <Form.Label className="text-nowrap">Conversation ID: </Form.Label>
                <div className="d-flex">
                    <Form.Control
                        className="me-2"
                        type="text"
                        value={convId}
                        onChange={(e) => {
                            setConvId(e.target.value);
                        }}
                    />
                    <Button variant="primary" className="text-nowrap" onClick={handleRetrieve}>
                        Retrieve Messages
                    </Button>
                </div>
            </Form>
            <div className="mt-4">
                {conversation ? (
                    <>
                        <h5>Subject: {conversation.subject}</h5>
                        {/* email notification checkbox */}
                        <Form.Check
                            type="checkbox"
                            label="Subscribe to email updates"
                            checked={emailsub}
                            onChange={handleSetEmailNotify}
                            disabled={uploading}
                        />
                        {/* message display container */}
                        <div style={{ maxHeight: "50vh", overflowY: "auto", display: "flex", flexDirection: "column-reverse" }}>
                            <ConversationDisplay conversation={conversation} handleDelete={handleDelete} handleEdit={handleEdit} />
                        </div>
                    </>
                ) : (
                    <div>Input conversation ID and click retrieve to display conversation</div>
                )}
            </div>
            {/* new message editor container */}
            <div className="mt-2">
                <Form>
                    <Form.Label className="text-nowrap">New Reply: </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                        }}
                        disabled={uploading}
                    />
                    <Button variant="success" className="text-nowrap mt-2 w-100" onClick={handleReply} disabled={uploading}>
                        Submit Reply {uploading ? <Spinner className="ms-2" size="sm" animation="border" /> : ""}
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default MessageTest;
