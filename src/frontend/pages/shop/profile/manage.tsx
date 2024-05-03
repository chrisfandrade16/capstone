/**
 * This is a NextPage associated with the profile of a shop page once it has been created by a shop owner.
 */

import { Button, Form } from "react-bootstrap";
import { NextPage } from "next";
import { useState, useEffect } from "react";
import CustomNavBar from "../../../components/navigation/navBar";

import { useAppContext } from "../../../context/state";
import {
    AFFLIATED_URL_WITH_ID,
    METHOD_TYPES,
    request,
    SHOP_URL_WITH_ID,
} from "../../../scripts/request";

const ManageShopProfile: NextPage = () => {
    const ctx = useAppContext();

    const [isEditing, setIsEditing] = useState<boolean>(false);

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [hours, setHours] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const [serverErrorMessage, setServerErrorMessage] = useState<string>("");

    useEffect(() => {
        const loadShop = async () => {
            const user_id = ctx.user ? ctx.user.id.toString() : "";
            if (user_id) {
                const shops_result = await request(
                    AFFLIATED_URL_WITH_ID(user_id),
                    null,
                    null
                );
                if (shops_result.success) {
                    const shop = shops_result.success.shop;
                    ctx.setShop(shop);

                    setName(shop.name || "Unset");
                    setEmail(shop.email || "Unset");
                    setPhone(shop.phone || "Unset");
                    setAddress(shop.address || "Unset");
                    setHours(shop.hours || "Unset");
                    setDescription(shop.description || "Unset");
                }
            }
        };
        loadShop();
    }, [ctx.user]);

    const shopProfileSectionTitle = "My Shop Profile";

    const cancelButtonText = "Cancel";
    const submitButtonText = "Save";

    const nameFieldText = "Name:";
    const emailFieldText = "Email:";
    const phoneFieldText = "Phone:";
    const addressFieldText = "Address:";
    const hoursFieldText = "Hours:";
    const descriptionFieldText = "Description:";

    const namePlaceholderText = "Enter name here";
    const emailPlaceholderText = "Enter email here";
    const phonePlaceholderText = "Enter phone here";
    const addressPlaceholderText = "Enter address here";
    const hoursPlaceholderText = "Enter hours here";
    const descriptionPlaceholderText = "Enter description here";

    const invalidUserMessage =
        "Sorry, this page is only available for shop owner accounts with a registered shop.";
    const invalidShopMessage =
        "Shop loading... (if this message persists, you may be accessing this page without a registered shop)";

    if (!ctx.user || ctx.user.role !== "shopowner") {
        return (
            <>
                <CustomNavBar />
                <div className="tw-flex tw-flex-col tw-gap-[20px] tw-py-[20px] tw-px-[80px]">
                    {invalidUserMessage}
                </div>
            </>
        );
    }

    if (!ctx.shop) {
        return (
            <>
                <CustomNavBar />
                <div className="tw-flex tw-flex-col tw-gap-[20px] tw-py-[20px] tw-px-[80px]">
                    {invalidShopMessage}
                </div>
            </>
        );
    }

    const user_shop = ctx.shop;

    return (
        <>
            <CustomNavBar />
            <div className="tw-flex tw-flex-col tw-gap-[20px] tw-py-[20px] tw-px-[80px]">
                <div className="tw-flex tw-flex-row tw-justify-between tw-items-center">
                    {shopProfileSectionTitle}
                    <div className="tw-flex tw-flex-row tw-gap-[12px]">
                        {!isEditing ? (
                            <Button
                                className="tw-h-[48px]"
                                variant="primary"
                                onClick={() => {
                                    setIsEditing(true);
                                }}
                            >
                                <i className="fa-solid fa-pen" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setServerErrorMessage("");
                                        setIsEditing(false);
                                        setName(user_shop.name || "Unset");
                                        setEmail(user_shop.email || "Unset");
                                        setPhone(user_shop.phone || "Unset");
                                        setAddress(user_shop.address || "Unset");
                                        setHours(user_shop.hours || "Unset");
                                        setDescription(user_shop.description || "Unset");
                                    }}
                                >
                                    {cancelButtonText}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={async () => {
                                        const updated_shop = {
                                            name,
                                            email,
                                            phone,
                                            address,
                                            hours,
                                            description,
                                        };
                                        const updated_shop_result = await request(
                                            SHOP_URL_WITH_ID(user_shop.id),
                                            METHOD_TYPES.UPDATE,
                                            updated_shop
                                        );

                                        if (updated_shop_result.failure) {
                                            setServerErrorMessage(updated_shop_result.failure);
                                        } else {
                                            setServerErrorMessage("");
                                            setIsEditing(false);

                                            ctx.setShop({
                                                ...user_shop,
                                                ...updated_shop,
                                            });
                                        }
                                    }}
                                >
                                    {submitButtonText}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                {serverErrorMessage ? (
                    <div className="tw-text-red-600">{serverErrorMessage}</div>
                ) : null}
                <div className="tw-flex tw-flex-col tw-gap-[12px]">
                    {!isEditing ? (
                        <>
                            <div>{`Name: ${name}`}</div>
                            <div>{`Email: ${email}`}</div>
                            <div>{`Phone: ${phone}`}</div>
                            <div>{`Address: ${address}`}</div>
                            <div>{`Hours: ${hours}`}</div>
                            <div>{`Description: ${description}`}</div>
                        </>
                    ) : (
                        <>
                            <Form.Group>
                                <Form.Label className="tw-font-semibold">
                                    {nameFieldText}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={namePlaceholderText}
                                    value={name}
                                    onChange={(event) => {
                                        setName(event.target.value);
                                    }}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="tw-font-semibold">
                                    {emailFieldText}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={emailPlaceholderText}
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                    }}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="tw-font-semibold">
                                    {phoneFieldText}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={phonePlaceholderText}
                                    value={phone}
                                    onChange={(event) => {
                                        setPhone(event.target.value);
                                    }}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="tw-font-semibold">
                                    {addressFieldText}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={addressPlaceholderText}
                                    value={address}
                                    onChange={(event) => {
                                        setAddress(event.target.value);
                                    }}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="tw-font-semibold">
                                    {hoursFieldText}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={hoursPlaceholderText}
                                    value={hours}
                                    onChange={(event) => {
                                        setHours(event.target.value);
                                    }}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="tw-font-semibold">
                                    {descriptionFieldText}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    type="text"
                                    placeholder={descriptionPlaceholderText}
                                    value={description}
                                    onChange={(event) => {
                                        setDescription(event.target.value);
                                    }}
                                />
                            </Form.Group>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ManageShopProfile;
