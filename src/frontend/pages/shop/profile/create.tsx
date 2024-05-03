/**
 * The NextPage used to create a new shop upon creation of a new shop owner account on the application.
 */

import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState, FunctionComponent } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

import { isEmailValid, isPhoneValid } from "../../../scripts/validation";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { useAppContext } from "../../../context/state";
import { METHOD_TYPES, request, SHOP_URL } from "../../../scripts/request";
import { formatPhoneNum } from "../../../scripts/inputFormatting";

interface Slide {
    label: string;
    isInvalid: boolean;
    feedback: string;
    type: "input" | "textarea";
    value: string;
    onBlur?: (arg: any, onChange: Function) => void;
    onChange: (arg: string) => void;
}

const CreateShop: NextPage = () => {
    const ctx = useAppContext();
    const router = useRouter();

    const [shopName, setShopName] = useState<string>("");
    const [shopAddress, setShopAddress] = useState<string>("");
    const [shopEmail, setShopEmail] = useState<string>("");
    const [shopPhone, setShopPhone] = useState<string>("");
    const [shopDescription, setShopDescription] = useState<string>("");

    const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

    const [isShopCreated, setIsShopCreated] = useState<boolean>(false);
    const [isShopCreating, setIsCreatingShop] = useState<boolean>(false);

    const [isShopCreationError, setIsShopCreationError] = useState<string>("");

    const [isNext, setIsNext] = useState(true);

    const slides: Array<Slide> = [
        {
            label: "Your Shop Name:",
            isInvalid: !shopName,
            feedback: "Your shop should have a name",
            type: "input",
            value: shopName,
            onChange: (value: string) => {
                setShopName(value);
            },
        },
        {
            label: "Your Shop Address:",
            isInvalid: !shopAddress,
            feedback: "Your shop should have a reference address",
            type: "input",
            value: shopAddress,
            onChange: async (value: string) => {
                setShopAddress(value);
            },
        },
        {
            label: "Your Shop Email:",
            isInvalid: !shopEmail || !isEmailValid(shopEmail),
            feedback: !shopEmail
                ? "Your shop should have a contact email"
                : "Not a valid email",
            type: "input",
            value: shopEmail,
            onChange: (value: string) => {
                setShopEmail(value);
            },
        },
        {
            label: "Your Shop Phone:",
            isInvalid: !shopPhone || !isPhoneValid(shopPhone),
            feedback: !shopPhone
                ? "Your shop should have a contact phone number"
                : "Not a valid phone number",
            type: "input",
            value: shopPhone,
            onBlur: (event: any, onChange: Function) => {
                const formattedValue = formatPhoneNum(event.target.value);
                if (formattedValue !== null) {
                    onChange(formattedValue);
                }
            },
            onChange: (value: string) => {
                setShopPhone(value);
            },
        },
        {
            label: "Your Shop Description:",
            isInvalid: !shopDescription,
            feedback: "Your shop should have a description",
            type: "textarea",
            value: shopDescription,
            onChange: (value: string) => {
                setShopDescription(value);
            },
        },
    ];

    const lastSlideIndex = slides.length - 1;

    const currentSlide = slides[currentSlideIndex];

    return (
        <div className="tw-bg-[#152238] tw-w-[100vw] tw-h-[100vh] tw-py-[8%] tw-px-[25%] tw-flex tw-box-border ">
            {isShopCreated ? (
                <div className="tw-items-center tw-w-[100%] tw-justify-center tw-flex tw-flex-col tw-gap-[20px] tw-text-white">
                    <Spinner animation="border" variant="primary" />
                    <div>{"Shop created in database! Redirecting..."}</div>
                </div>
            ) : null}
            {!isShopCreated && isShopCreating ? (
                <div className="tw-items-center tw-w-[100%] tw-justify-center tw-flex tw-flex-col tw-gap-[20px] tw-text-white">
                    <Spinner animation="border" variant="primary" />
                    <div>{"Reqeust sent to server! Creating shop..."}</div>
                </div>
            ) : null}
            {isShopCreationError ? (
                <div className="tw-self-center tw-w-[100%] tw-items-center tw-justify-center tw-flex tw-flex-col tw-gap-[20px] tw-text-white">
                    <div>{"Error from server during shop creation: "}</div>
                    <div>{isShopCreationError}</div>
                    <Button
                        variant="danger"
                        onClick={() => {
                            setCurrentSlideIndex(0);
                            setIsShopCreationError("");
                        }}
                    >
                        {"Restart"}
                    </Button>
                </div>
            ) : null}
            {!isShopCreated && !isShopCreating && !isShopCreationError ? (
                <div className="tw-flex tw-flex-row tw-items-center tw-gap-[80px] tw-w-[100%]">
                    <div className="tw-flex tw-w-[40px] tw-h-[100%] tw-items-center tw-min-h-[1px]">
                        {currentSlideIndex != 0 ? (
                            <Button
                                className="!tw-border-[#0d6efd] !tw-bg-[#152238] !tw-color-[#ffffff] !tw-cursor-pointer hover:!tw-bg-[#0d6efd]"
                                onClick={() => {
                                    setIsNext(false);
                                    setCurrentSlideIndex(currentSlideIndex - 1);
                                }}
                            >
                                {"<"}
                            </Button>
                        ) : null}
                    </div>
                    {currentSlideIndex <= lastSlideIndex ? (
                        <TransitionGroup
                            className="tw-flex-1 tw-h-[100%] tw-flex tw-flex-row tw-overflow-hidden tw-relative tw-justify-center"
                            childFactory={(child) =>
                                React.cloneElement(child, {
                                    classNames: isNext ? "right-to-left" : "left-to-right",
                                    timeout: 1000,
                                })
                            }
                        >
                            <CSSTransition
                                key={currentSlide.label}
                                classNames="right-to-left"
                                timeout={0}
                            >
                                <FieldGroup slide={currentSlide} />
                            </CSSTransition>
                        </TransitionGroup>
                    ) : (
                        <div className="tw-flex tw-flex-col tw-gap-[20px] tw-flex-1 tw-h-[100%] tw-justify-center tw-items-center tw-text-white">
                            <div className="tw-font-semibold">
                                {"Does the following information look correct?"}
                            </div>
                            <div className="tw-flex tw-flex-col tw-gap-[10px]">
                                <div>{`Shop Name: ${shopName}`}</div>
                                <div>{`Shop Address: ${shopAddress}`}</div>
                                <div>{`Shop Email: ${shopEmail}`}</div>
                                <div>{`Shop Phone: ${shopPhone}`}</div>
                                <div>{`Shop Description: ${shopDescription}`}</div>
                            </div>
                            <div className="tw-flex tw-flex-row tw-justify-end tw-gap-[12px] tw-mt-[20px]">
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        setShopName("");
                                        setShopAddress("");
                                        setShopEmail("");
                                        setShopPhone("");
                                        setShopDescription("");
                                        setCurrentSlideIndex(0);
                                    }}
                                >
                                    {"Restart"}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={async () => {
                                        setIsCreatingShop(true);
                                        let longitude;
                                        let latitude;
                                        const formattedAddress = shopAddress.replace(/ /g, "+");
                                        const data = await fetch(
                                            `https://nominatim.openstreetmap.org/search?q=${formattedAddress}&limit=1&format=jsonv2`
                                        );
                                        const data_json = await data.json();
                                        console.log(data_json);
                                        if (data_json.length > 0) {
                                            // Valid address: 13 Broad Street Hamilton
                                            latitude = data_json[0].lat;
                                            longitude = data_json[0].lon;
                                        } else {
                                            latitude = "5";
                                            longitude = "5";
                                        }
                                        const result = await request(
                                            SHOP_URL,
                                            METHOD_TYPES.CREATE,
                                            {
                                                name: shopName,
                                                address: shopAddress,
                                                email: shopEmail,
                                                phone: shopPhone,
                                                description: shopDescription,
                                                owner: ctx.user?.id,
                                                latitude: latitude,
                                                longitude: longitude,
                                            }
                                        );
                                        if (result.failure) {
                                            setIsShopCreationError(result.failure);
                                        } else {
                                            setIsShopCreated(true);
                                            router.push("../../profile/profile");
                                        }
                                        setIsCreatingShop(false);
                                    }}
                                >
                                    {"Yes!"}
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className="tw-flex tw-w-[40px] tw-h-[100%] tw-items-center tw-min-h-[1px]">
                        {currentSlideIndex <= lastSlideIndex ? (
                            <Button
                                className={
                                    currentSlide.isInvalid
                                        ? "!tw-border-[#a9a9a9] !tw-bg-[#152238] !tw-color-[#444444] !tw-cursor-not-allowed hover:!tw-bg-[#152238] !tw-opacity-50"
                                        : "!tw-border-[#0d6efd] !tw-bg-[#152238] !tw-color-[#ffffff] !tw-cursor-pointer hover:!tw-bg-[#0d6efd]"
                                }
                                onClick={() => {
                                    if (!currentSlide.isInvalid) {
                                        setIsNext(true);
                                        setCurrentSlideIndex(currentSlideIndex + 1);
                                    }
                                }}
                            >
                                {">"}
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

type FieldGroupProps = {
    slide: Slide;
};

const FieldGroup: FunctionComponent<FieldGroupProps> = (props: {
    slide: Slide;
}) => {
    const { slide } = props;
    return (
        <div className="tw-absolute tw-flex tw-flex-col tw-gap-[20px] tw-flex-1 tw-h-[100%] tw-justify-center tw-items-center">
            <Form.Group className="tw-w-[250px] tw-h-[100px] slide-in">
                <Form.Label className="tw-font-semibold tw-text-white">
                    {slide.label}
                </Form.Label>
                <Form.Control
                    className="tw-max-h-[200px]"
                    required
                    as={slide.type}
                    isInvalid={slide.isInvalid}
                    type="text"
                    placeholder={"Enter field here..."}
                    value={slide.value}
                    onBlur={(event: any) => {
                        if (slide.onBlur) {
                            slide.onBlur(event, slide.onChange);
                        }
                    }}
                    onChange={(event: any) => {
                        slide.onChange(event.target.value);
                    }}
                />
                <Form.Control.Feedback type="invalid">
                    {slide.feedback}
                </Form.Control.Feedback>
                <Form.Control.Feedback type="valid">
                    {"Looks good!"}
                </Form.Control.Feedback>
            </Form.Group>
        </div>
    );
};

export default CreateShop;
