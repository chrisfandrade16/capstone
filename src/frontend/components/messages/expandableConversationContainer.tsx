/**
 * A functional component to handle the expandable conversation container that appears at the bottom of a quote/quote request.
 */

import { useEffect, useState, FC } from "react";
import Button from "react-bootstrap/Button";
import { Form, Spinner, Collapse, Badge } from "react-bootstrap";
import { useAppContext } from "../../context/state";
import { getConversation, sendMessage, deleteMessage, editMessage, setEmailNotify, Conversation, readAll } from "../../scripts/conversation";
import ConversationDisplay from "./conversationDisplay";
import styles from "../../styles/Chat.module.css";
import { useRouter } from "next/router";

type Props = {
    convId: number;
    className?: string;
};

const ExpandableConversationContainer: FC<Props> = ({ convId, className }) => {
    const ctx = useAppContext();
    const router = useRouter();
    const expandChat = router.query.chat;

    const [conversation, setConversation] = useState<Conversation | undefined>(undefined);
    const [emailsub, setEmailsub] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [newCount, setNewCount] = useState(0);

    const [uploading, setUploading] = useState(false);
    const [expand, setExpand] = useState(false);

    const handleRetrieve = () => {
        console.log(`refreshing chat: ${convId}`);
        getConversation(ctx, convId, (result: Conversation) => {
            let new_count = 0;
            result.messages.forEach((message) => {
                if (message.isNew && message.author) new_count++;
            });
            setNewCount(new_count);
            setConversation(result);
            setEmailsub(result.emailSubscribed);
        });
    };

    const handleReply = () => {
        setExpand(true);
        setUploading(true);
        sendMessage(
            ctx,
            convId,
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

    const handleRead = () => {
        if (newCount > 0) {
            readAll(ctx, convId, () => {
                handleRetrieve();
            });
        }
    };

    useEffect(() => {
        if (expandChat) setExpand(true);
        handleRetrieve();
        const refreshTimer = setInterval(() => {
            handleRetrieve();
        }, 10000);
        return () => {
            clearInterval(refreshTimer);
        };
    }, []);

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
        <div className={className}>
            <Button
                size="sm"
                variant="secondary"
                className="w-100 m-0 rounded-0 p-0"
                style={{ fontSize: "0.8em" }}
                onClick={() => setExpand((old) => !old)}
            >
                <i className={`fa-solid fa-chevron-${expand ? "down" : "up"}`} />
            </Button>
            <Collapse in={expand}>
                <div>
                    {conversation ? (
                        <>
                            {/* message display container */}
                            <div style={{ maxHeight: "60vh", overflowY: "auto", display: "flex", flexDirection: "column-reverse" }}>
                                <ConversationDisplay
                                    className="px-3 mb-3"
                                    conversation={conversation}
                                    handleDelete={handleDelete}
                                    handleEdit={handleEdit}
                                    handleRead={handleRead}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-danger">Loading Comments...</div>
                    )}
                </div>
            </Collapse>
            {/* new message editor container */}
            <div className="p-3 pt-2 bg-dark text-light">
                <Form>
                    <div className="d-flex justify-content-between">
                        <Form.Label className="text-nowrap">Chat</Form.Label>
                        {newCount > 0 ? (
                            <div
                                className={styles.newMessageAlert + " text-warning"}
                                onClick={() => {
                                    setExpand(true);
                                }}
                            >
                                <span className="text-light">{newCount}</span> new message(s)
                            </div>
                        ) : (
                            ""
                        )}
                        <Form.Check
                            type="checkbox"
                            label="Subscribe to email updates"
                            checked={emailsub}
                            onChange={handleSetEmailNotify}
                            disabled={uploading}
                        />
                    </div>

                    <div className="d-flex gap-2">
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                            }}
                            disabled={uploading}
                            placeholder="Enter chat message here"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleReply();
                                }
                            }}
                        />
                        <Button variant="primary px-3" title="Send" onClick={handleReply} disabled={uploading}>
                            {uploading ? <Spinner size="sm" animation="border" /> : <i className="fa-regular fa-paper-plane" />}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ExpandableConversationContainer;
