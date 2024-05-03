/**
 * A functional component to handle the creation of a new quote request on the user side of the application.
 * This also handles the creation of a quote to be sent to the selected shops by the user.
 */

import React, { FC, useState, useEffect, useMemo } from "react";
import Select from "react-select";
import Link from "next/link";
import DatePicker from "react-datepicker";
import { Form, Button, Container, Nav, Spinner } from "react-bootstrap";

import { useAppContext } from "../../context/state";
import { useRouter } from "next/router";
import { getShops } from "../../scripts/shop";
import { getMakes, getUserVehicles, createVehicle } from "../../scripts/vehicles";
import { Shop, Makes, Models, Vehicle } from "../../components/types";
import { createQuoteRequest, searchShops } from "../../scripts/quotes";
import { Dictionary, imageFile } from "../../scripts/common";
import { formatFileSize } from "../../scripts/quotes";
import ImageContainer from "./imageContainer";

import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/Quotes.module.css";

type Props = {
    selectedShops: Number[];
};

const NewQuoteRequestContainer: FC<Props> = ({ selectedShops }) => {
    const router = useRouter();
    const ctx = useAppContext();

    const [shopData, setShopData] = useState([] as Shop[]);

    const [userVehicleData, setUserVehicleData] = useState([] as Vehicle[]);
    const [vehicleDB, setVehicleDB] = useState([] as Makes[]);
    const [vehicleModels, setVehicleModels] = useState([] as Models[]);
    const [vehicleYears, setVehicleYears] = useState([] as string[]);
    const [toggleModel, setToggleModel] = useState(true);
    const [toggleYear, setToggleYear] = useState(true);
    const [newMake, setNewMake] = useState(Number);
    const [newModel, setNewModel] = useState(Number);
    const [newYear, setNewYear] = useState(Number);
    const [newVIN, setNewVIN] = useState("");
    const [newPlateNumber, setNewPlateNumber] = useState("");
    const [availability, setAvailability] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedVehicle, setSelectedVehicle] = useState(Number);
    const [description, setDescription] = useState("");
    const [partPreference, setPartPreference] = useState("any");
    const [displayAdditionalVehicle, setDisplayAdditionalVehicle] = useState(false);
    const [selectedShopList, setSelectedShopList] = useState([]);
    const [presetServices, setPresetServices] = useState([]);

    const [searchAddr, setSearchAddr] = useState("");
    const [searchRadius, setSearchRadius] = useState("10");

    const [searchResults, setSearchResults] = useState({ shops: [], distances: [] });
    const [searchError, setSearchError] = useState("");

    const [error, setError] = useState("");

    const presetServiceStr = useMemo(() => {
        return presetServices.length > 0 ? "[Services requested: " + presetServices.map((service) => service.value).join(", ") + "]" : "";
    }, [presetServices]);

    const shopOptions = useMemo(
        () =>
            shopData.map((shop) => ({
                value: shop.id,
                label: shop.name,
            })),
        [shopData]
    );

    const handleAdditionalVehicle = () => {
        setDisplayAdditionalVehicle(true);
    };

    const searchResultListing = useMemo(
        () =>
            searchResults.shops.map((shop, i) => (
                <Form.Check
                    key={i}
                    type="checkbox"
                    label={
                        <>
                            {shop.name} <span className="ms-4">{shop.address}</span>{" "}
                            <span className="text-primary ms-4">[{searchResults.distances[i].toFixed(2)}km]</span>
                        </>
                    }
                    onChange={(e) => {
                        let shop = searchResults.shops[i];
                        if (e.target.checked) {
                            setSelectedShopList((old) => {
                                const temp = [...old];
                                temp.push({
                                    value: shop.id,
                                    label: shop.name,
                                });
                                return temp;
                            });
                        } else {
                            for (let i = 0; i < selectedShopList.length; i++) {
                                console.log(selectedShopList[i].value, shop.id);
                                if (selectedShopList[i].value == shop.id) {
                                    // found unselected shop in selected shop list, remove from list
                                    break;
                                }
                            }
                            // delete shop from list
                            if (i < selectedShopList.length) {
                                setSelectedShopList((old) => {
                                    const temp = [...old];
                                    temp.splice(i, 1);
                                    console.log(temp);
                                    return temp;
                                });
                            }
                        }
                    }}
                />
            )),
        [searchResults, selectedShopList]
    );

    const serviceOptions = useMemo(
        () => [
            { value: "Tire change", label: "Tire change" },
            { value: "Oil/filter change", label: "Oil/filter change" },
            { value: "Brake service", label: "Brake service" },
            { value: "Transmission service", label: "Transmission service" },
            { value: "Battery swap", label: "Battery swap" },
            { value: "Fluid check", label: "Fluid check" },
        ],
        []
    );

    const [loading, setLoading] = useState(false);

    const handleQuoteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(false);
        let userVehicle = 0;

        const photos_upload: File[] = [];
        Object.keys(photos).forEach((filename) => {
            if (photos[filename].status === "new") photos_upload.push(photos[filename].file);
        });

        const newAvail = startDate.toDateString() + "-" + endDate.toDateString() + " | Additional info: " + availability;

        // upload new images to db
        const upload_data = new FormData();
        photos_upload.forEach((image) => {
            upload_data.append("images", image);
        });

        const shop_list = selectedShopList.map((shop) => shop.value);

        if (displayAdditionalVehicle || userVehicleData.length === 0) {
            createVehicle(
                newMake,
                newModel,
                newYear,
                newVIN,
                newPlateNumber,
                Number(ctx.user?.id),
                (result) => {
                    createQuoteRequest(
                        Number(ctx.user?.id),
                        description + "\n\n" + presetServiceStr,
                        partPreference,
                        result.vehicle.id,
                        newAvail,
                        upload_data,
                        shop_list,
                        (result) => {
                            router.push("/quotes");
                        },
                        (result) => {
                            setError(JSON.stringify(result.error || result.failure || "Error"));
                        }
                    );
                },
                (result) => {
                    if (result.error) setError(result.error);
                    else if (result.failure) setError(JSON.stringify(result.failure));
                    setLoading(false);
                }
            );
        } else {
            userVehicle = userVehicleData[selectedVehicle].id;
            createQuoteRequest(
                Number(ctx.user?.id),
                description + "\n\n" + presetServiceStr,
                partPreference,
                userVehicle,
                newAvail,
                upload_data,
                shop_list,
                (result) => {
                    router.push("/quotes");
                },
                (result) => {
                    setError(JSON.stringify(result.error || result.failure || "Error"));
                }
            );
        }
    };

    const [searchBusy, setSearchBusy] = useState(false);
    const handleSearch = () => {
        setSearchError("");
        setSearchBusy(true);
        searchShops(
            searchAddr,
            searchRadius,
            (result) => {
                setSearchResults(result);
                setSearchBusy(false);
            },
            (result) => {
                setSearchError(result.error || result.failure);
                setSearchBusy(false);
            }
        );
    };

    const getVehicleData = async () => {
        const resp = await getMakes();
        setVehicleDB(resp);
    };

    const getShopData = async () => {
        const resp = await getShops();
        console.log(resp);
        setShopData(resp.success.shops);
        // populate shops if passed in query params
        if (router.query.shops) {
            const preselected_shops = JSON.parse(`[${router.query.shops}]`);
            const preselected_set = new Set(preselected_shops);
            resp.success.shops.forEach((shop) => {
                if (preselected_set.has(shop.id)) selectedShopList.push({ value: shop.id, label: <span title={shop.address}>{shop.name}</span> });
            });
        }
    };

    const getUserVehicleData = async () => {
        const resp = await getUserVehicles(String(ctx.user?.email));
        setUserVehicleData(resp);
    };

    const handleVehicleMake = (event: React.ChangeEvent<HTMLSelectElement>) => {
        event.preventDefault();
        const make = event.currentTarget.value as string;
        console.log(make);
        setToggleModel(false);
        console.log(toggleModel);
        let vid = 0;
        for (let i = 0; i < vehicleDB.length; i++) {
            if (vehicleDB[i].name === make) {
                vid = i;
                break;
            }
        }
        console.log(vid);
        console.log(vehicleDB[vid].models);
        setVehicleModels(vehicleDB[vid].models as unknown as Models[]);
        setNewMake(vid + 1);
    };

    const handleVehicleModel = (event: React.ChangeEvent<HTMLSelectElement>) => {
        event.preventDefault();
        const model = event.currentTarget.value as string;
        console.log(model);
        setToggleYear(false);
        let vid = 0;
        let index = 0;
        for (let i = 0; i < vehicleDB.length; i++) {
            if (vehicleModels[i].name === model) {
                index = i;
                vid = vehicleModels[i].id;
                break;
            }
        }
        console.log(vid);
        console.log(vehicleModels[index].name);
        setVehicleYears(vehicleModels[index].years);
        console.log("vehicle id for model: " + vid);
        setNewModel(vid);
    };

    // initializes images
    const [photos, setPhotos] = useState<Dictionary<imageFile>>({});

    // add photos to the upload queue
    const addPhoto = (file: File) => {
        if (photos[file.name] !== undefined) {
            alert("You have already selected this image file!");
            return;
        }
        const new_photos = { ...photos };
        new_photos[file.name] = { url: URL.createObjectURL(file), size: file.size, file: file, status: "new" };
        setPhotos(new_photos);
        console.log(file.name);
    };

    // remove new photos from upload queue, or move existing image to deletion queue
    const removePhoto = (filename: string) => {
        const new_photos = { ...photos };
        if (new_photos[filename].status === "new") delete new_photos[filename];
        else {
            new_photos[filename].status = "delete";
        }
        setPhotos(new_photos);
    };

    const filesStat = useMemo(() => {
        let size = 0;
        let count = 0;
        Object.keys(photos).forEach((key) => {
            if (photos[key].status !== "delete") {
                size += photos[key].size;
                count += 1;
            }
        });
        return { size: size, count: count };
    }, [photos]);

    useEffect(() => {
        if (ctx.user) {
            getShopData();
            getVehicleData();
            getUserVehicleData();
        }
    }, [ctx]);

    return (
        <>
            <div className={styles.quoteNavBar + " sticky-top shadow"}>
                <Container className="d-flex">
                    <div className="align-self-center">
                        <Link href="/quotes">Back</Link>
                    </div>
                    <Nav className="flex-fill justify-content-end h6 navbar-dark">
                        <Nav.Item>
                            <Nav.Link href="#customer-section">Contact</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#vehicle-section">Vehicle</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#details-section">Details</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#shops-section">Shops</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Container>
            </div>
            <Container>
                <div className="my-2 p-3 bg-light rounded text-dark">
                    <h5>New Quote Request</h5>
                    <Form onSubmit={handleQuoteSubmit} className="d-grid">
                        <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border" id="customer-section">
                            <h5>Your Contact</h5>
                            <div className="d-flex">
                                <div className="flex-fill me-2">
                                    <Form.Label className="mt-2">First Name</Form.Label>
                                    <div className="border rounded p-2 bg-white text-dark">{ctx.user?.first_name}</div>
                                </div>
                                <div className="flex-fill">
                                    <Form.Label className="mt-2">Last Name</Form.Label>
                                    <div className="border rounded p-2 bg-white text-dark">{ctx.user?.last_name}</div>
                                </div>
                            </div>
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control type="text" placeholder="Email Address" readOnly defaultValue={ctx.user?.email} />
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control type="text" placeholder="Phone Number" readOnly defaultValue={ctx.user?.phone} />
                        </div>
                        {userVehicleData.length != 0 && !displayAdditionalVehicle ? (
                            <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border" id="vehicle-section">
                                <h5>Your Vehicle Information</h5>
                                <Form.Select disabled={displayAdditionalVehicle} onChange={(e) => setSelectedVehicle(e.target.options.selectedIndex)}>
                                    {userVehicleData?.map((vehicle, i) => {
                                        return <option key={`car-${i}`}>{vehicle.year + " " + vehicle.make + " " + vehicle.model}</option>;
                                    })}
                                </Form.Select>
                                <Button className="vehButton mt-2 w-100" size="sm" variant="outline-primary" onClick={handleAdditionalVehicle}>
                                    Add New Vehicle
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border">
                                <h5>Add New Vehicle</h5>
                                <Form.Label>Select Vehicle Make</Form.Label>
                                <Form.Select required onChange={handleVehicleMake}>
                                    <option hidden></option>
                                    {vehicleDB?.map((vehicles) => {
                                        return (
                                            <option key={vehicles.id} value={vehicles.name}>
                                                {vehicles.name}
                                            </option>
                                        );
                                    })}
                                </Form.Select>
                                {/* Conditional for choosing vehicle make -> once make is selected, choose model */}
                                {!toggleModel ? (
                                    <div>
                                        <Form.Label>Select Vehicle Model</Form.Label>
                                        <Form.Select required onChange={handleVehicleModel}>
                                            <option hidden></option>
                                            {vehicleModels.map((vehicles) => {
                                                return (
                                                    <option key={vehicles.id} value={vehicles.name}>
                                                        {vehicles.name}
                                                    </option>
                                                );
                                            })}
                                        </Form.Select>
                                    </div>
                                ) : (
                                    ""
                                )}
                                {!toggleYear ? (
                                    <div>
                                        <Form.Label>Select Vehicle Year</Form.Label>
                                        <Form.Select
                                            required
                                            //onchange
                                            onChange={(e) => setNewYear(Number(e.target.value))}
                                        >
                                            <option hidden></option>
                                            {vehicleYears.map((years) => {
                                                return (
                                                    <option key={years} value={years}>
                                                        {years}
                                                    </option>
                                                );
                                            })}
                                        </Form.Select>
                                    </div>
                                ) : (
                                    ""
                                )}
                                <Form.Label>Vehicle Identification Number</Form.Label>
                                <Form.Control required onChange={(e) => setNewVIN(e.target.value)} />
                                <Form.Label>Plate Number</Form.Label>
                                <Form.Control required onChange={(e) => setNewPlateNumber(e.target.value)} />
                            </div>
                        )}
                        <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border" id="details-section">
                            <h5>Service Details</h5>
                            <Form.Text></Form.Text>
                            <Form.Control
                                as="textarea"
                                required
                                rows={5}
                                placeholder="Please provide details about your service request / issues"
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {presetServiceStr}
                            <Select
                                className="mt-2"
                                options={serviceOptions}
                                isMulti
                                value={presetServices}
                                onChange={(e) => setPresetServices(e)}
                                placeholder="(Optional) Select from list of services"
                            />
                        </div>

                        <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border">
                            <Form.Label>Photo (Optional)</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    console.log(e);
                                    if (e.target.files.length > 0) addPhoto(e.target.files[0]);
                                }}
                            />
                            {filesStat.count > 0 ? (
                                <div className="fw-normal">
                                    <div className="d-flex justify-content-between">
                                        <span>{filesStat.count} files</span>
                                        <span>Total size: {formatFileSize(filesStat.size)}</span>
                                    </div>
                                    <ImageContainer handleDelete={removePhoto} photos={photos} />
                                </div>
                            ) : (
                                ""
                            )}
                        </div>
                        <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border">
                            <h5>Part Preference (if applicable)</h5>
                            <Form.Select placeholder="Select a part preference..." onChange={(e) => setPartPreference(e.target.value)}>
                                <option value="any">Any</option>
                                <option value="new">New</option>
                                <option value="used">Used</option>
                                <option value="oem">OEM</option>
                                <option value="aftermarket">Aftermarket</option>
                            </Form.Select>
                        </div>
                        <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border" id="shops-section">
                            <h5>Select Shops</h5>
                            <Select
                                isMulti
                                options={shopOptions}
                                value={selectedShopList}
                                onChange={(e) => setSelectedShopList(e)}
                                placeholder="Search by Name"
                                className="fw-normal"
                            />
                            <hr />
                            <div className="mt-2 d-flex">
                                <Form.Label className="align-self-center me-2">Address:</Form.Label>
                                <Form.Control
                                    placeholder="Search by Address"
                                    className="rounded"
                                    value={searchAddr}
                                    onChange={(e) => setSearchAddr(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                ></Form.Control>
                                <Form.Label className="align-self-center mx-2 text-nowrap">Radius:</Form.Label>
                                <Form.Control
                                    placeholder="Max Distance (km)"
                                    className="rounded w-25"
                                    value={searchRadius}
                                    onChange={(e) => setSearchRadius(e.target.value)}
                                    onBlur={(e) => {
                                        if (isNaN(parseInt(searchRadius))) setSearchRadius("10");
                                        else setSearchRadius(parseInt(searchRadius).toString());
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                ></Form.Control>
                            </div>
                            {searchError ? <Form.Text className="text-danger">{searchError}</Form.Text> : ""}
                            <Button variant="outline-primary" disabled={searchAddr === ""} className="w-100 mt-2" size="sm" onClick={handleSearch}>
                                {searchBusy ? <Spinner animation="border" size="sm" /> : "Search"}
                            </Button>
                            <div className="mt-2">{searchResultListing}</div>
                        </div>
                        <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border">
                            <h5>Availability</h5>
                            <Form.Label>Select an availability range:</Form.Label>
                            <div className="startDate">
                                <DatePicker
                                    selected={startDate}
                                    required
                                    onChange={(date) => setStartDate(date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            </div>
                            <h6>to:</h6>
                            <div className="endDate">
                                <DatePicker
                                    selected={endDate}
                                    required
                                    onChange={(date) => setEndDate(date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                />
                            </div>
                            <br />
                            <Form.Control
                                type="text"
                                placeholder="Specify any additional availability info"
                                onChange={(e) => setAvailability(e.target.value)}
                            />
                        </div>
                        {error ? <Form.Text className="text-danger">{error}</Form.Text> : ""}
                        <Button variant="success" className="mb-2" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner size="sm" className="me-2" animation="border" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Quote Request"
                            )}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                router.push("/quotes");
                            }}
                        >
                            Cancel
                        </Button>
                    </Form>
                </div>
            </Container>
        </>
    );
};

export default NewQuoteRequestContainer;
