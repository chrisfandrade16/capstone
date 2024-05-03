/**
 * A modal that is used in the customer user profile to add a new vehicle to their information.
 */

import { useState } from "react";
import { useAppContext } from "../../context/state";
import { addVehicleToCustomer } from "./profileSlice";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const VehicleModal = (props) => {
    const ctx = useAppContext();

    const [selectedMake, setSelectedMake] = useState(0);
    const [selectedModel, setSelectedModel] = useState(0);
    const [selectedYear, setSelectedYear] = useState(0);

    const buildMakeOptions = () => {
        let outList = [];
        for (let i = 0; i < props.vehiclesInfo.length; i++) {
            outList.push(<option value={i}>{props.vehiclesInfo[i].name}</option>);
        }
        return outList;
    };

    const buildModelOptions = () => {
        let outList = [];
        for (let i = 0; i < props.vehiclesInfo[selectedMake].models.length; i++) {
            outList.push(
                <option value={i}>
                    {props.vehiclesInfo[selectedMake].models[i].name}
                </option>
            );
        }
        return outList;
    };

    const buildYearOptions = () => {
        let outList = [];
        for (
            let i = 0;
            i < props.vehiclesInfo[selectedMake].models[selectedModel].years.length;
            i++
        ) {
            outList.push(
                <option value={i}>
                    {props.vehiclesInfo[selectedMake].models[selectedModel].years[i]}
                </option>
            );
        }
        return outList;
    };

    const handleMakeChange = (e) => {
        if (e) {
            setSelectedMake(e.target.value);
            setSelectedModel(0);
            setSelectedYear(0);
        }
    };

    const handleModelChange = (e) => {
        if (e) {
            setSelectedModel(e.target.value);
            setSelectedYear(0);
        }
    };

    const handleYearChange = (e) => {
        if (e) {
            setSelectedYear(e.target.value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const result = {
            make: parseInt(selectedMake) + 1,
            model: parseInt(selectedModel) + 1,
            year: parseInt(
                props.vehiclesInfo[selectedMake].models[selectedModel].years[
                selectedYear
                ],
                10
            ),
            plate_number: formData.get("plateNumber"),
            vin: formData.get("vin"),
        };
        console.log(result);
        console.log(ctx.user.id);
        addVehicleToCustomer(ctx.user.id, ctx.tokens.accessToken, result).then(
            (response) => {
                if (response.success) {
                    props.onHide();
                    return;
                }
                console.log(response.failure);
            }
        );
    };

    if (props.vehiclesInfo && props.vehiclesInfo.length != 0) {
        return (
            <Modal
                show={props.show}
                onHide={props.onHide}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                className="tw-text-black"
            >
                <Modal.Header closeButton>Add New Vehicle</Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Label>Make</Form.Label>
                        <Form.Select
                            name="make"
                            onChange={handleMakeChange}
                            value={selectedMake}
                            id="makeSelection"
                        >
                            {buildMakeOptions()}
                        </Form.Select>
                        <Form.Label>Model</Form.Label>
                        <Form.Select
                            name="model"
                            onChange={handleModelChange}
                            value={selectedModel}
                        >
                            {buildModelOptions()}
                        </Form.Select>
                        <Form.Label>Year</Form.Label>
                        <Form.Select
                            name="year"
                            onChange={handleYearChange}
                            value={selectedYear}
                        >
                            {buildYearOptions()}
                        </Form.Select>
                        <Form.Label>Plate Number</Form.Label>
                        <Form.Control name="plateNumber" />
                        <Form.Label>VIN</Form.Label>
                        <Form.Control name="vin" />
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    }
    return null;
};

export default VehicleModal;
