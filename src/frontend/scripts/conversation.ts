/**
 * API calls for conversation messages between a customer and shop owner/employee 
 */

import { AppContextInterface } from "../context/state";
import { Person, Dictionary } from "./common";

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

interface MessageRaw {
    id: number;
    author: string;
    created_at: string;
    editted_at: string;
    deleted_at: string;
    message: string;
}

interface ConversationRaw {
    id: number;
    subject: string;
    last_read: string;
    messages: MessageRaw[];
    participants: Person[];
    email_subscribed: boolean;
}

export class Message {
    id: number;
    message: string;
    author: string;
    isNew: boolean;
    isMine: boolean;
    created_at: Date;
    deleted_at: Date | null;
    editted_at: Date | null;

    constructor(message_raw: MessageRaw, isNew: boolean, isMine: boolean) {
        this.id = message_raw.id;
        this.message = message_raw.message;
        this.author = message_raw.author;
        this.isNew = isNew;
        this.isMine = isMine;
        this.created_at = new Date(message_raw.created_at);
        this.deleted_at = message_raw.deleted_at ? new Date(message_raw.deleted_at) : null;
        this.editted_at = message_raw.editted_at ? new Date(message_raw.editted_at) : null;
    }
}

export class Conversation {
    id: number;
    messages: Message[];
    participants: Dictionary<Person>;
    subject: string;
    emailSubscribed: boolean;

    constructor(ctx: AppContextInterface, conversation_raw: ConversationRaw) {
        this.id = conversation_raw.id;
        this.subject = conversation_raw.subject;
        this.emailSubscribed = conversation_raw.email_subscribed;
        this.messages = conversation_raw.messages.map(
            (message_raw) => new Message(message_raw, message_raw.created_at > conversation_raw.last_read, message_raw.author == ctx.user?.username)
        );
        // create a dictionary of username: user_details
        this.participants = {};
        conversation_raw.participants.forEach((participant) => {
            this.participants[participant.username] = participant;
        });
    }
}

export const getConversation = (ctx: AppContextInterface, convId: number, successCallback: any = undefined, failCallback: any = undefined) => {
    let error = false;
    fetch(API_HOST_URL + `/msgs/${convId}`, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            if (error) {
                console.error(result);
                if (failCallback) failCallback(result);
            } else {
                console.log(result);
                let parsed = new Conversation(ctx, result);
                console.log(parsed);
                if (successCallback) successCallback(parsed);
            }
        });
};

export const sendMessage = (
    ctx: AppContextInterface,
    convId: number,
    message: string,
    successCallback: any = undefined,
    failCallback: any = undefined
) => {
    let error = false;
    fetch(API_HOST_URL + `/msgs/${convId}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ message: message }),
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            if (error) {
                console.error(result);
                if (failCallback) failCallback(result);
            } else {
                if (successCallback) successCallback(result);
            }
        });
};

export const readAll = (ctx: AppContextInterface, convId: number, successCallback: any = undefined, failCallback: any = undefined) => {
    let error = false;
    fetch(API_HOST_URL + `/msgs/${convId}/read`, {
        headers: {
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            if (error) {
                console.error(result);
                if (failCallback) failCallback(result);
            } else {
                if (successCallback) successCallback(result);
            }
        });
};

export const deleteMessage = (ctx: AppContextInterface, msgId: number, successCallback: any = undefined, failCallback: any = undefined) => {
    let error = false;
    fetch(API_HOST_URL + `/msgs/${msgId}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            if (error) {
                console.error(result);
                if (failCallback) failCallback(result);
            } else {
                if (successCallback) successCallback(result);
            }
        });
};

export const editMessage = (
    ctx: AppContextInterface,
    msgId: number,
    message: string,
    successCallback: any = undefined,
    failCallback: any = undefined
) => {
    let error = false;
    fetch(API_HOST_URL + `/msgs/${msgId}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ message: message }),
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            if (error) {
                console.error(result);
                if (failCallback) failCallback(result);
            } else {
                if (successCallback) successCallback(result);
            }
        });
};

export const setEmailNotify = (
    ctx: AppContextInterface,
    convId: number,
    enabled: boolean,
    successCallback: any = undefined,
    failCallback: any = undefined
) => {
    let error = false;
    fetch(API_HOST_URL + `/msgs/${convId}/notify?enabled=${enabled}`, {
        headers: {
            Authorization: `Token ${localStorage.getItem("accessToken")}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            if (error) {
                console.error(result);
                if (failCallback) failCallback(result);
            } else {
                if (successCallback) successCallback(result);
            }
        });
};
