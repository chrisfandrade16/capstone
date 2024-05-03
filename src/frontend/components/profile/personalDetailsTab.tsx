/**
 * A functional component to handle the displaying and editing of a user's personal information on the profile page.
 */

import type { FC } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { useAppContext } from "../../context/state";
import { getUserInfo, changeUserInfo } from "./profileSlice";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const CustomControl: FC = (props) => {
    if (props.enabled) {
        return <Form.Control type="text" value={props.value} onChange={(e) => { props.callback(e) }} />
    }
    return <Form.Control disabled value={props.value} />
};

const DetailDisplay: FC = (props) => {

    const [editMode, setEditMode] = useState(false);;
    const ctx = useAppContext();
    const router = useRouter();

    const [uid, set_uid] = useState(null);
    const [username, set_username] = useState("Loading...");
    const [firstname, set_firstname] = useState("Loading...");
    const [lastname, set_lastname] = useState("Loading...");
    const [email, set_email] = useState("Loading...");
    const [role, set_role] = useState("Loading...");
    const [phone, set_phone] = useState("Loading...");
    //const [address, set_address] = useState("Loading...");

    const updateUserInfo = () => {
        getUserInfo(ctx.tokens.accessToken).then((response) => {
            if (!response) {
                console.log("Auth error, signing out...");
                logout(ctx);
                router.push("/auth/login");
                return;
            }
            updateState(response)
        })
    };

    const updateState = (res) => {
        set_uid(res.id)
        set_username(res.username)
        set_firstname(res.first_name)
        set_lastname(res.last_name)
        set_email(res.email)
        set_role(res.role)
        set_phone(res.phone)
        //set_address(res.address)
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let userObj = {
            first_name: firstname,
            last_name: lastname,
            email: email,
            phone: phone
        }

        if (![firstname, lastname, email, phone].includes("Loading...") && uid != null) {
            changeUserInfo(uid, userObj, ctx.tokens.accessToken).then((res) => {
                console.log(res)
                ctx.setUser({
                    id: uid,
                    username: username,
                    role: role,
                    ...userObj
                })
            })
        }

        setEditMode(!editMode)
    };

    useEffect(() => {
        if (!ctx.tokens) {
            console.log("Auth error, signing out...");
            logout(ctx);
            router.push("/auth/login");
        }
        updateUserInfo();
    }, []);

    return (
        <>
            <Container>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Username</Form.Label>
                        <CustomControl enabled={false} value={username} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>First Name</Form.Label>
                        <CustomControl enabled={editMode} type="text" value={firstname} callback={(e) => { set_firstname(e.target.value) }} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <CustomControl enabled={editMode} type="text" value={lastname} callback={(e) => { set_lastname(e.target.value) }} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Email Address</Form.Label>
                        <CustomControl enabled={editMode} type="text" value={email} callback={(e) => { set_email(e.target.value) }} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Phone Number</Form.Label>
                        <CustomControl enabled={editMode} type="text" value={phone} callback={(e) => { set_phone(e.target.value) }} />
                    </Form.Group>
                    {/*<Form.Group>
            <Form.Label>Address</Form.Label>
            <CustomControl enabled={editMode} type="text" value={address} onChange={(e) => {set_address(e.target.value)}}/>
          </Form.Group>*/}
                    <Form.Group>
                        <Form.Label>Role</Form.Label>
                        <CustomControl enabled={false} type="text" value={role} callback={(e) => { set_role(e.target.value) }} />
                    </Form.Group>
                    <Button variant="link" type="submit">{editMode ? "Save" : "Edit"}</Button>
                </Form>
            </Container>
        </>
    );
};

const DetailsTab: FC = () => {

    return (
        <>
            <Container>
                <DetailDisplay />
            </Container>
        </>
    );
};

export default DetailsTab;