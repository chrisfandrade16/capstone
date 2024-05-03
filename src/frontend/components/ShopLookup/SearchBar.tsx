/**
 * A functional component that houses the search bar on the shop lookup page visible from the customer side of the application.
 */

import React, { Dispatch, SetStateAction } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { createGeoLocation } from "../../scripts/createLocation";
import { GeoLocation } from "../types";

const SearchBar = ({ setQuery, setLocationQuery, setSearchBy, setSortBy, searchBy }: { setQuery: Dispatch<SetStateAction<string>>, setLocationQuery: Dispatch<SetStateAction<GeoLocation>>, setSearchBy: Dispatch<SetStateAction<string>>, setSortBy: Dispatch<SetStateAction<string>>, searchBy: string }) => {
    const geoLocateUrl = "https://nominatim.openstreetmap.org/search?";

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        let userQuery = e.target.value;
        console.log(`Searching for "${userQuery}"`);

        if (userQuery === "" || searchBy === "1") {
            console.log("Shop Name")
            setQuery(userQuery)
            setLocationQuery({ latitude: 43.257921, longitude: -79.918836 } as GeoLocation)
        }
        if (searchBy === "2") {
            try {
                let formattedAddress = userQuery.replace(/ /g, "+")
                const data = await fetch(geoLocateUrl + `q=${formattedAddress}&limit=1&format=jsonv2`)
                const res = await data.json();
                if (res.length > 0) {
                    setQuery("")
                    setLocationQuery(createGeoLocation(res))
                } else {
                    setLocationQuery({} as GeoLocation)
                }
            } catch (err) {
                console.log(err)
            }
        }
    };

    const handleSearchChange = (e: any) => {
        setSearchBy(e.target.value)
    };

    const handleSortChange = (e: any) => {
        setSortBy(e.target.value)
    };

    return (
        <div style={{ width: "60%", padding: "2vh" }}>
            <InputGroup onSubmit={handleSubmit}>
                <Form.Control className="w-50"
                    placeholder="Search by"
                    aria-label="Search Bar"
                    onKeyDown={(e) => { if (e.key === "Enter") { handleSubmit(e) } }}
                />
                <Form.Select aria-label="Default select example"
                    onChange={(e) => handleSearchChange(e)}
                >
                    <option value="1">Shop Name</option>
                    <option value="2">Location</option>
                </Form.Select>
                <Form.Select aria-label="Default select example"
                    onChange={(e) => handleSortChange(e)}
                >
                    <option value="1">Sort by Distance</option>
                    <option value="2">Sort by Name A-Z</option>
                    <option value="3">Sort by Name Z-A</option>
                </Form.Select>
            </InputGroup>
        </div>
    );
};

export default SearchBar;