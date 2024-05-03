/**
 * A component that handles the shop filter displayed on the shop lookup page that allows the user to search for a shop using different parameters.
 */

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Service } from "../types";
import { Form, InputGroup } from "react-bootstrap";

const createServices = (res: any) => {
    let services: Service[] = []

    res.forEach((s: any) => {
        let service: Service = {
            id: s.id,
            name: s.name,
            description: s.description
        }
        services.push(service)
    })

    return services;
};

const ShopFilter = ({ filters, setFilters, distance, setDistance }: { filters: Set<number>, setFilters: Dispatch<SetStateAction<Set<number>>>, distance: number, setDistance: Dispatch<SetStateAction<number>> }) => {
    const getServicesUrl = process.env.NEXT_PUBLIC_API_URL + "/service";

    const [services, setServices] = useState([] as Service[]);
    // const [directBookingOn, setDirectBookingOn] = useState(false);
    const [showMoreOn, setShowMoreOn] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            await fetch(`${getServicesUrl}`)
                .then(data => { return data.json() })
                .then(res => { setServices(createServices(res)) })
        };

        fetchServices().catch(console.error);
    }, []);

    const handleChange = (e: any) => {
        e.preventDefault()
        let value = Math.max(1, Math.min(100, Number(e.target.value)));
        setDistance(value);
    };

    const handleCheck = (e: any) => {
        let newSet = new Set(filters);
        let serviceId = Number(e.target.id);
        if (newSet.has(serviceId)) {
            newSet.delete(serviceId);
        } else {
            newSet.add(serviceId);
        }
        setFilters(newSet);
    };

    return (
        <div style={{ width: "15%", padding: "3vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* <Form>
                <Form.Label>Direct Booking Only</Form.Label>
                <Form.Check 
                    type="switch"
                    id="direct-booking-switch"
                    label= {directBookingOn ? "On" : "Off"}
                    onChange={e => setDirectBookingOn(!directBookingOn)}
                />
            </Form>

            <hr></hr> */}

            {/* <Form>
                <Form.Label>Select Date Range</Form.Label>
            </Form>

            <hr></hr> */}

            <Form.Label>Filter By Distance (km)</Form.Label>
            <InputGroup>
                <Form.Control
                    type="number"
                    inputMode="numeric"
                    value={distance.toString()}
                    onChange={e => handleChange(e)}
                />
            </InputGroup>

            <hr></hr>

            <Form>
                <Form.Label>Services</Form.Label>
                <p>{Array.from(filters).toString()}</p>
                {services.slice(0, !showMoreOn ? 5 : services.length).map((service) => (
                    <div key={`${service.id}`} className="mb-3">
                        <Form.Check
                            type="checkbox"
                            id={service.id.toString()}
                            label={service.name}
                            onChange={e => handleCheck(e)}
                        />
                    </div>
                ))}
            </Form>
            <a href="#" onClick={e => setShowMoreOn(!showMoreOn)}>
                {"Show " + `${!showMoreOn ? "More" : "Less"}`}
            </a>
        </div>
    );
};

export default ShopFilter;