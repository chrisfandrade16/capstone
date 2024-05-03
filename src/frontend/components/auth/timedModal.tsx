/**
 * A modal to show a redirect is in progress (e.g. for the login process)
 */

import { useEffect, useState, Dispatch, SetStateAction } from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

type Props = {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    delay: number;
    body: string;
};

const TimedModal = ({ show, setShow, delay, body }: Props) => {
    const [seconds, setSeconds] = useState(0);
    const [timer, setTimer] = useState<any>();

    useEffect(() => {
        if (show) {
            console.log("SHOW");
            setSeconds(delay);
            let t = setInterval(() => {
                setSeconds((old) => {
                    console.log(old);
                    if (old <= 1) {
                        clearInterval(t);
                    }
                    return old - 1;
                });
            }, delay * 1000);
            setTimer(t);
        }
    }, [show, delay]);

    return (
        <Modal show={show} onHide={() => setShow(false)}>
            <Modal.Body>
                <div className="d-flex flex-column">
                    <div>{body}</div>
                    <div>Automatically redirecting in {seconds} s...</div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TimedModal;
