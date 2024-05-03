/**
 * The functional component that deals with the notification panel that can be seen on any user account type on the application.
 */

import { useRouter } from "next/router";
import { FC, useState, useEffect } from "react";
import { Badge, Offcanvas } from "react-bootstrap";

interface NotificationProps {
    userId: number;
}

const NotificationPanel: FC<NotificationProps> = ({ userId }) => {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        fetchNotifications(userId);
        const refreshTimer = setInterval(() => {
            fetchNotifications(userId);
        }, 10000);
        return () => {
            clearInterval(refreshTimer);
        };
    }, [userId]);

    const fetchNotifications = (userId: number) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + `/notifications/${userId}`)
            .then((data) => {
                return data.json();
            })
            .then((result) => {
                console.log(notifications)
                setNotifications(result.notifications);
            });
    };

    const deleteNotification = (pk: number) => {
        fetch(process.env.NEXT_PUBLIC_API_URL + `/notifications/${pk}`, {
            method: "DELETE",
        })
            .then((data) => {
                console.log(data);
                fetchNotifications(userId);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const handleRedirect = (notification) => {
        // deleteNotification(notification.id)
        console.log(notification);
        if (notification.notice_type === "message") {
            router.push(`/quotes?quoteId=${notification.quote}&chat=true`);
        } else if (notification.notice_type === "quote") {
            router.push(`/quotes?quoteId=${notification.quote}`);
        }
    };

    return (
        <>
            <div
                className="text-muted"
                style={{ cursor: "pointer" }}
                onClick={() => {
                    setShowNotifications(!showNotifications);
                }}
            >
                {notifications.length > 0 ? (
                    <div>
                        <i className="fa-solid fa-bell me-1" />
                        <Badge className="rounded-circle me-1" bg="danger">
                            {notifications.length}
                        </Badge>
                    </div>
                ) : (
                    <div>
                        <i className="fa-regular fa-bell me-1" />
                    </div>
                )}
            </div>

            <Offcanvas
                show={showNotifications}
                onHide={() => {
                    setShowNotifications(false);
                }}
                placement="end"
                className="bg-dark"
            >
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title>
                        Notifications <Badge className="ms-2">{notifications.length}</Badge>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {notifications.length > 0 ? (
                        <div className="d-flex flex-column gap-2">
                            {notifications.map((notification, i) => (
                                <div
                                    key={i}
                                    className="bg-dark border border-secondary rounded p-0 d-flex shadow position-relative"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        handleRedirect(notification);
                                    }}
                                >
                                    <div
                                        className="position-absolute end-0 p-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log(notification);
                                            deleteNotification(notification.id);
                                        }}
                                    >
                                        <i className="fa-solid fa-xmark fs-5 text-muted" />
                                    </div>
                                    <div className="align-self-center text-center" style={{ width: "42px", minWidth: "42px" }}>
                                        {notification.notice_type === "quote" ? (
                                            <i className="fa-regular fa-file fs-4 text-info" title="New Quote Notification" />
                                        ) : (
                                            <i className="fa-regular fa-comment fs-4 text-success" title="New Chat Notification"></i>
                                        )}
                                    </div>
                                    <div className="py-2 pe-2">
                                        <div className="text-light opacity-50">{new Date(notification.created).toLocaleString()}</div>
                                        <div className="fw-normal text-white">{notification.detail}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <i className="fa-regular fa-star me-2" />
                            You have no new notifications.
                        </div>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default NotificationPanel