/**
 * This is a NextPage associated with managing services that belong to a shop.
 */

import { Button, Dropdown, Form } from "react-bootstrap";
import { NextPage } from "next";
import { useState, useEffect, FunctionComponent } from "react";
import CustomNavBar from "../../../components/navigation/navBar";

import {
    Service,
    Shop,
    ShopService,
    useAppContext,
} from "../../../context/state";
import {
    AFFLIATED_URL_WITH_ID,
    METHOD_TYPES,
    request,
    SERVICE_URL,
    SHOP_SERVICE_URL_WITH_ID,
} from "../../../scripts/request";

const ManageShopServices: NextPage = () => {
    const ctx = useAppContext();

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
                    const shop_services_result = await request(
                        SHOP_SERVICE_URL_WITH_ID(shop.id),
                        METHOD_TYPES.READ,
                        null
                    );
                    if (shop_services_result.success) {
                        const shop_services = shop_services_result.success.services;
                        shop.services = shop_services;
                        ctx.setShop(shop);

                        const services_result = await request(
                            SERVICE_URL,
                            METHOD_TYPES.READ,
                            null
                        );
                        if (services_result.success) {
                            const services = services_result.success.data;
                            ctx.setServices(services);
                        }
                    }
                }
            }
        };
        loadShop();
    }, [ctx.user]);

    const shopServicesSectionTitle = "My Shop Services";

    const invalidUserMessage =
        "Sorry, this page is only available for shop owner accounts with a registered shop.";
    const invalidShopMessage =
        "Shop loading... (if this message persists, you may be accessing this page without a registered shop)";
    const invalidServicesMessage = "General services loading...";

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

    if (!ctx.services) {
        return (
            <>
                <CustomNavBar />
                <div className="tw-flex tw-flex-col tw-gap-[20px] tw-py-[20px] tw-px-[80px]">
                    {invalidServicesMessage}
                </div>
            </>
        );
    }

    const user_shop = ctx.shop;
    const general_services = ctx.services;

    return (
        <>
            <CustomNavBar />
            <div className="tw-flex tw-flex-col tw-gap-[20px] tw-py-[20px] tw-px-[80px]">
                <div className="tw-flex tw-flex-col tw-gap-[20px]">
                    {shopServicesSectionTitle}
                    <div className="responsive-grid">
                        {user_shop.services.map((shop_service: ShopService) => {
                            return (
                                <ShopServiceCard
                                    isNewType={false}
                                    service={shop_service}
                                    services={general_services}
                                    shop={user_shop}
                                    setShop={ctx.setShop}
                                    key={shop_service.id}
                                />
                            );
                        })}
                        <ShopServiceCard
                            isNewType={true}
                            service={{
                                id: "-1",
                                name: "",
                                description: "",
                                price: "",
                                est_time: "",
                                canned: false,
                            }}
                            services={general_services}
                            shop={user_shop}
                            setShop={ctx.setShop}
                            key={-1}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

interface ShopServiceCardProps {
    isNewType: boolean;
    service: ShopService;
    services: Array<Service>;
    shop: Shop;
    setShop: Function;
}

const ShopServiceCard: FunctionComponent<ShopServiceCardProps> = (
    props: ShopServiceCardProps
) => {
    const isNewType = props.isNewType;
    const service = props.service;
    const services = props.services;
    const shop = props.shop;
    const setShop = props.setShop;

    const [isEditing, setIsEditing] = useState<boolean>(false);

    const [name, setName] = useState<string>(service.name);
    const [description, setDescription] = useState<string>(service.description);
    const [price, setPrice] = useState<string>(service.price);
    const [estimatedTime, setEstimatedTime] = useState<string>(service.est_time);
    const [quickBooking, setQuickBooking] = useState<boolean>(service.canned);

    const [existingServiceId, setExistingServiceId] = useState<string>("");

    const [fieldErrorMessage, setFieldErrorMessage] = useState<string>("");

    const importServiceButtonText = "Import Service";

    const cancelButtonText = "Cancel";
    const submitButtonText = "Save";

    const nameFieldText = "Name:";
    const descriptionFieldText = "Description:";
    const priceFieldText = "Price:";
    const estimatedTimeFieldText = "Estimated Time:";
    const quickBookingFieldText = "Quick Booking:";

    const namePlaceholderText = "Enter name here";
    const descriptionPlaceholderText = "Enter description here";
    const pricePlaceholderText = "Example: 25.52";
    const estimatedTimePlaceholderText = "Example: 02:35";

    if (isNewType && !isEditing) {
        return (
            <div
                className="tw-text-white tw-w-[200px] tw-min-h-[250px] tw-flex tw-gap-[12px] tw-p-[16px] tw-bg-transparent hover:tw-bg-slate-400 tw-transition tw-duration-500 tw-border-solid tw-border-white tw-border-4 tw-rounded tw-shadow-lg tw-justify-center tw-items-center"
                onClick={() => {
                    setIsEditing(true);
                }}
            >
                {"+"}
            </div>
        );
    }

    return (
        <div className="tw-flex tw-flex-col tw-gap-[12px] tw-p-[16px] tw-bg-white tw-rounded tw-shadow-lg">
            <div className="tw-flex tw-flex-row tw-justify-between tw-gap-[10px]">
                <div className="tw-break-all">{service.name || "New Service"}</div>
                <div className="tw-flex tw-flex-row tw-gap-[6px]">
                    {!isEditing ? (
                        <>
                            <Button
                                className="tw-h-[48px]"
                                variant="danger"
                                onClick={async () => {
                                    const delete_service_result = await request(
                                        SHOP_SERVICE_URL_WITH_ID(shop.id),
                                        METHOD_TYPES.DELETE,
                                        { id: service.id }
                                    );
                                    if (delete_service_result.failure) {
                                        setFieldErrorMessage(delete_service_result.failure);
                                    } else {
                                        setShop({
                                            ...shop,
                                            services: shop.services.filter(
                                                (s) => s.id !== service.id
                                            ),
                                        });
                                    }
                                }}
                            >
                                <i className="fa-solid fa-trash" />
                            </Button>
                            <Button
                                className="tw-h-[48px]"
                                variant="primary"
                                onClick={() => {
                                    setIsEditing(true);
                                }}
                            >
                                <i className="fa-solid fa-pen" />
                            </Button>
                        </>
                    ) : null}
                </div>
            </div>
            <div className="tw-flex tw-flex-col tw-gap-[6px]">
                {isEditing ? (
                    <div className="tw-flex tw-flex-col tw-gap-[12px]">
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary">
                                {importServiceButtonText}
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                                variant="dark"
                                className="tw-h-[150px] tw-overflow-y-scroll"
                            >
                                {services.map((s) => {
                                    return (
                                        <Dropdown.Item
                                            onClick={() => {
                                                setName(s.name);
                                                setDescription(s.description);
                                                setExistingServiceId(s.id);
                                            }}
                                            key={s.id}
                                        >
                                            {s.name}
                                        </Dropdown.Item>
                                    );
                                })}
                            </Dropdown.Menu>
                        </Dropdown>
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
                                    setExistingServiceId("");
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
                                    setExistingServiceId("");
                                }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="tw-font-semibold">
                                {priceFieldText}
                            </Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder={pricePlaceholderText}
                                value={price}
                                onChange={(event) => {
                                    setPrice(event.target.value);
                                }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="tw-font-semibold">
                                {estimatedTimeFieldText}
                            </Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder={estimatedTimePlaceholderText}
                                value={estimatedTime}
                                onChange={(event) => {
                                    setEstimatedTime(event.target.value);
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="tw-flex tw-flex-row tw-gap-[12px]">
                            <Form.Label className="tw-font-semibold">
                                {quickBookingFieldText}
                            </Form.Label>
                            <Form.Check
                                type="checkbox"
                                checked={quickBooking}
                                onChange={(event) => {
                                    setQuickBooking(!quickBooking);
                                }}
                            />
                        </Form.Group>
                    </div>
                ) : (
                    <div className="tw-flex tw-flex-col tw-gap-[8px]">
                        <div>{`Name: ${name}`}</div>
                        <div>{`Description: ${description || "Unset"}`}</div>
                        <div>{`Price: ${price || "Unset"} `}</div>
                        <div>{`Estimated Time: ${estimatedTime || "Unset"}`}</div>
                        <div>{`Quick Booking: ${quickBooking}`}</div>
                    </div>
                )}
                {fieldErrorMessage ? (
                    <div className="tw-text-red-600">{fieldErrorMessage}</div>
                ) : null}
            </div>
            {isEditing ? (
                <div className="tw-flex tw-flex-row tw-justify-end tw-gap-[6px]">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setName(service.name);
                            setDescription(service.description);
                            setPrice(service.price);
                            setEstimatedTime(service.est_time);
                            setQuickBooking(service.canned);
                            setExistingServiceId("");
                            setIsEditing(false);
                            setFieldErrorMessage("");
                        }}
                    >
                        {cancelButtonText}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={async () => {
                            const new_service: any = {
                                name: name,
                                description: description,
                            };
                            const updated_shop_service: any = {
                                price: price,
                                est_time: estimatedTime,
                                canned: quickBooking,
                            };

                            const add_service_result = existingServiceId
                                ? { success: { id: existingServiceId } }
                                : await request(SERVICE_URL, METHOD_TYPES.CREATE, new_service);
                            if (add_service_result.failure) {
                                setFieldErrorMessage(add_service_result.failure);
                            } else {
                                updated_shop_service.service = add_service_result.success.id;
                                if (!isNewType) {
                                    updated_shop_service.id = service.id;
                                }
                                const update_shop_service_result = await request(
                                    SHOP_SERVICE_URL_WITH_ID(shop.id),
                                    isNewType ? METHOD_TYPES.CREATE : METHOD_TYPES.UPDATE,
                                    updated_shop_service
                                );
                                if (update_shop_service_result.failure) {
                                    setFieldErrorMessage(update_shop_service_result.failure);
                                } else {
                                    setIsEditing(false);
                                    setFieldErrorMessage("");
                                    setExistingServiceId("");

                                    const new_shop_service = {
                                        id: update_shop_service_result.success.id,
                                        ...new_service,
                                        ...updated_shop_service,
                                    };

                                    const updated_shop = {
                                        ...shop,
                                    };

                                    if (isNewType) {
                                        updated_shop.services.push(new_shop_service);

                                        setName(service.name);
                                        setDescription(service.description);
                                        setPrice(service.price);
                                        setEstimatedTime(service.est_time);
                                        setQuickBooking(service.canned);
                                    } else {
                                        const shop_service_index = shop.services.findIndex(
                                            (s) => s.id === service.id
                                        );
                                        updated_shop.services[shop_service_index] =
                                            new_shop_service;
                                    }

                                    setShop(updated_shop);
                                }
                            }
                        }}
                    >
                        {submitButtonText}
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

export default ManageShopServices;
