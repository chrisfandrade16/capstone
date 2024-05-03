/**
 * A NextPage that displays when the shop manages their employees and employee account information.
 */

import { Button, Form } from "react-bootstrap";
import { NextPage } from "next";
import { isEmailValid } from "../../../scripts/validation";
import { useState, useEffect, FunctionComponent } from "react";
import CustomNavBar from "../../../components/navigation/navBar";
import { register } from "../../../scripts/auth";

import { Employee, Shop, useAppContext } from "../../../context/state";
import {
    ACTIVATE_URL,
    AFFLIATED_URL_WITH_ID,
    EMPLOYEE_URL_WITH_ID,
    METHOD_TYPES,
    request,
    SHOPS_URL,
    SHOP_URL_WITH_ID,
} from "../../../scripts/request";

const ManageShopEmployees: NextPage = () => {
    const ctx = useAppContext();

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const [email, setEmail] = useState<string>("");
    const [emailError, setEmailError] = useState<boolean>(false);

    const [serverError, setServerError] = useState<boolean>(false);
    const [serverErrorMessage, setServerErrorMessage] = useState<string>("");

    useEffect(() => {
        const loadShop = async () => {
            const user_id = ctx.user ? ctx.user.id.toString() : "";
            if (user_id) {
                const shop_result = await request(
                    AFFLIATED_URL_WITH_ID(user_id),
                    null,
                    null
                );
                if (shop_result.success) {
                    const shop = shop_result.success.shop;
                    const employees_result = await request(
                        EMPLOYEE_URL_WITH_ID(shop.id),
                        METHOD_TYPES.READ,
                        null
                    );
                    if (employees_result.success) {
                        const employees = employees_result.success.employees;
                        shop.employees = employees;
                        ctx.setShop(shop);
                    }
                }
            }
        };
        loadShop();
    }, [ctx.user]);

    const emailErrorMessage = "Email entered is not a valid email";
    const usernameErrorMessage = "Employee invitation already sent";
    const successMessage = "Invitation sent to employee";

    const emailPlaceholderText = "Enter employee's email";
    const submitText = "Send invite to employee";

    const addEmployeeSectionTitle = "Invite Employee to Shop";
    const editEmployeeSectionTitle = "My Shop Employees";

    const noEmployeesText = "No shop employees added yet!";

    const invalidUserMessage =
        " Sorry, this page is only available for shop owner accounts with a registered shop.";
    const invalidShopMessage =
        "Shop loading... (if this message persists, you may be accessing this page without a registered shop)";

    const showErrorMessage = isSubmitted && (emailError || serverError);
    const showSuccessMessage = isSubmitted && !emailError && !serverError;

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

    const user = ctx.user;
    const user_first_name = user.first_name;
    const user_last_name = user.first_name;
    const user_shop = ctx.shop;
    const user_shop_employees = user_shop.employees;

    return (
        <>
            <CustomNavBar />
            <div className="tw-flex tw-flex-col tw-gap-[20px] tw-py-[20px] tw-px-[80px]">
                <>
                    <div className="tw-flex tw-flex-col tw-gap-[20px]">
                        {addEmployeeSectionTitle}
                        <div className="tw-flex tw-flex-row tw-gap-[12px]">
                            <Form.Group className="tw-w-[250px] tw-flex tw-flex-col tw-gap-[6px]">
                                <Form.Control
                                    isInvalid={showErrorMessage}
                                    isValid={showSuccessMessage}
                                    type="text"
                                    placeholder={emailPlaceholderText}
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);

                                        setIsSubmitted(false);
                                        setEmailError(false);
                                        setServerError(false);
                                        setServerErrorMessage("");
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {emailError
                                        ? emailErrorMessage
                                        : serverError
                                            ? serverErrorMessage
                                            : ""}
                                </Form.Control.Feedback>
                                <Form.Control.Feedback type="valid">
                                    {successMessage}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Button
                                className="tw-w-fit tw-h-[40px]"
                                type="submit"
                                onClick={async () => {
                                    setIsSubmitted(true);

                                    if (!isEmailValid(email)) {
                                        setEmailError(true);
                                        return;
                                    }

                                    const formData = new FormData();
                                    formData.append("email", email);
                                    formData.append("username", email);
                                    formData.append("firstName", user_first_name);
                                    formData.append("lastName", user_last_name);
                                    formData.append("role", "e");

                                    await register(
                                        formData,
                                        async (result: any) => {
                                            setServerError(false);
                                            setServerErrorMessage("");

                                            const new_employee_id = result.userid;
                                            const new_shop: any = {
                                                ...user_shop,
                                                employees: [
                                                    ...user_shop_employees,
                                                    {
                                                        id: new_employee_id,
                                                        email: email,
                                                        username: email,
                                                        first_name: user_first_name,
                                                        last_name: user_last_name,
                                                        phone: "",
                                                        salary: 0,
                                                    },
                                                ],
                                            };

                                            ctx.setShop(new_shop);

                                            const new_shop_copy = { ...new_shop };

                                            new_shop_copy.employees = new_shop_copy.employees.map(
                                                (employee: Employee) => employee.id
                                            );

                                            const update_shop_result = await request(
                                                SHOP_URL_WITH_ID(new_shop_copy.id),
                                                METHOD_TYPES.UPDATE,
                                                new_shop_copy
                                            );
                                            if (update_shop_result.failure) {
                                                setServerError(true);
                                                setServerErrorMessage(update_shop_result.failure);
                                            } else {
                                                const invite_employee_result = await request(
                                                    ACTIVATE_URL,
                                                    METHOD_TYPES.CREATE,
                                                    {
                                                        email: email,
                                                    }
                                                );
                                                if (invite_employee_result.failure) {
                                                    setServerError(true);
                                                    setServerErrorMessage(invite_employee_result.failure);
                                                }
                                            }
                                        },
                                        (result: any) => {
                                            setServerError(true);

                                            if (result.type === "USERNAME_EXISTS") {
                                                setServerErrorMessage(usernameErrorMessage);
                                            } else {
                                                setServerErrorMessage(result.detail);
                                            }
                                        }
                                    );
                                }}
                            >
                                {submitText}
                            </Button>
                        </div>
                    </div>
                    <div className="tw-flex tw-flex-col tw-gap-[20px]">
                        {editEmployeeSectionTitle}
                        <div className="responsive-grid">
                            {user_shop_employees.length
                                ? user_shop_employees.map((employee: Employee) => {
                                    return (
                                        <EmployeeCard
                                            employee={employee}
                                            shop={user_shop}
                                            setShop={ctx.setShop}
                                            key={employee.id}
                                        />
                                    );
                                })
                                : <div className="tw-text-white">{noEmployeesText}</div>}
                        </div>
                    </div>
                </>
            </div>
        </>
    );
};

interface EmployeeCardProps {
    employee: Employee;
    shop: Shop;
    setShop: Function;
}

const EmployeeCard: FunctionComponent<EmployeeCardProps> = (
    props: EmployeeCardProps
) => {
    const employee = props.employee;
    const shop = props.shop;
    const setShop = props.setShop;

    const [isEditing, setIsEditing] = useState<boolean>(false);

    const [email, setEmail] = useState<string>(employee.email);
    const [username, setUsername] = useState<string>(employee.username);
    const [firstName, setFirstName] = useState<string>(employee.first_name);
    const [lastName, setLastName] = useState<string>(employee.last_name);
    const [phone, setPhone] = useState<string>(employee.phone);
    const [salary, setSalary] = useState<number>(employee.salary);

    const [fieldErrorMessage, setFieldErrorMessage] = useState<string>("");

    return (
        <div className="tw-flex tw-flex-col tw-gap-[12px] tw-p-[16px] tw-bg-white tw-rounded tw-shadow-lg">
            <div className="tw-flex tw-flex-row tw-justify-between tw-gap-[10px]">
                <div className="">{`${employee.first_name} ${employee.last_name}`}</div>
                <div className="tw-flex tw-flex-row tw-gap-[6px]">
                    {!isEditing ? (
                        <>
                            <Button
                                className="tw-h-[48px]"
                                variant="danger"
                                onClick={async () => {
                                    const delete_employee_result = await request(
                                        EMPLOYEE_URL_WITH_ID(employee.id),
                                        METHOD_TYPES.DELETE,
                                        null
                                    );
                                    if (delete_employee_result.failure) {
                                        setFieldErrorMessage(delete_employee_result.failure);
                                    } else {
                                        setShop({
                                            ...shop,
                                            employees: shop.employees.filter(
                                                (e) => e.id !== employee.id
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
                    <div className="tw-flex tw-flex-col tw-gap-[8px]">
                        <Form.Group>
                            <Form.Label className="tw-font-semibold">{"Email"}</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder={"Enter email here"}
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="tw-font-semibold">{"Username"}</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder={"Enter username here"}
                                value={username}
                                onChange={(event) => {
                                    setUsername(event.target.value);
                                }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="tw-font-semibold">
                                {"First Name"}
                            </Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder={"Enter first name here"}
                                value={firstName}
                                onChange={(event) => {
                                    setFirstName(event.target.value);
                                }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="tw-font-semibold">
                                {"Last Name"}
                            </Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder={"Enter last name here"}
                                value={lastName}
                                onChange={(event) => {
                                    setLastName(event.target.value);
                                }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="tw-font-semibold">{"Phone"}</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder={"Enter phone here"}
                                value={phone}
                                onChange={(event) => {
                                    setPhone(event.target.value);
                                }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="tw-font-semibold">{"Salary"}</Form.Label>
                            <Form.Control
                                required
                                type="number"
                                placeholder={"Enter salary here"}
                                value={salary}
                                onChange={(event) => {
                                    setSalary(parseInt(event.target.value));
                                }}
                            />
                        </Form.Group>
                    </div>
                ) : (
                    <div className="tw-flex tw-flex-col tw-gap-[8px]">
                        <div>{`Email: ${email}`}</div>
                        <div>{`Username: ${username}`}</div>
                        <div>{`First Name: ${firstName} `}</div>
                        <div>{`Last Name: ${lastName}`}</div>
                        <div>{`Phone: ${phone || "Unset"}`}</div>
                        <div>{`Salary: ${salary}`}</div>
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
                            setEmail(employee.email);
                            setUsername(employee.username);
                            setFirstName(employee.first_name);
                            setLastName(employee.last_name);
                            setPhone(employee.phone);
                            setSalary(employee.salary);
                            setIsEditing(false);
                            setFieldErrorMessage("");
                        }}
                    >
                        {"Cancel"}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={async () => {
                            const updated_employee = {
                                id: employee.id,
                                username: username,
                                email: email,
                                first_name: firstName,
                                last_name: lastName,
                                phone: phone,
                                salary: salary,
                            };

                            const update_employee_result = await request(
                                EMPLOYEE_URL_WITH_ID(employee.id),
                                METHOD_TYPES.UPDATE,
                                updated_employee
                            );
                            if (update_employee_result.failure) {
                                setFieldErrorMessage(update_employee_result.failure);
                            } else {
                                setIsEditing(false);
                                setFieldErrorMessage("");

                                const employee_index = shop.employees.findIndex(
                                    (e) => e.id === employee.id
                                );
                                const updated_shop = {
                                    ...shop,
                                };

                                updated_shop.employees[employee_index] = updated_employee;
                                setShop(updated_shop);
                            }
                        }}
                    >
                        {"Save"}
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

export default ManageShopEmployees;
