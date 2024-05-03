/**
 * A functional component to handle the modification of a quote request selected from the list of quote requests on the user side of the application
 */

import { FC, useState, useEffect, useMemo } from "react";
import { Form, Button, Container, Nav } from "react-bootstrap";
import { useRouter } from "next/router";
import path from "path";

import { Dictionary, imageFile } from "../../scripts/common";
import { useAppContext } from "../../context/state";
import { formatFileSize, getQuoteRequest } from "../../scripts/quotes";
import ImageContainer from "./imageContainer";

import styles from "../../styles/Quotes.module.css";
import Link from "next/link";

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

const QuoteRequestModify: FC = () => {
    const ctx = useAppContext();
    const router = useRouter();
    const queryId = router.query.QuoteId;
    const [modifiedDescription, setModifiedDescription] = useState("");
    const [modifiedAvailability, setModifiedAvailability] = useState("");
    const [modifiedPartPreference, setModifiedPartPreference] = useState("");
    const [quoteRequest, setQuoteRequest] = useState();

    const [loading, setLoading] = useState(true);

    // messy request, but the idea is to update the quote content, then upload images, then delete images as necessary
    const handleQuoteRequestModify = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let error = false;
        let putDescription = "";
        let putAvailability = "";
        let putPartPreference = "";
        if (modifiedDescription === "") {
            putDescription = quoteRequest.description;
        } else {
            putDescription = modifiedDescription;
        }
        if (modifiedAvailability === "") {
            putAvailability = quoteRequest.availability;
        } else {
            putAvailability = modifiedAvailability;
        }
        if (modifiedPartPreference === "") {
            putPartPreference = quoteRequest.part_preference;
        } else {
            putPartPreference = modifiedPartPreference;
        }

        const photos_upload: File[] = [];
        const photos_delete: number[] = [];
        Object.keys(photos).forEach((filename) => {
            if (photos[filename].status === "new") photos_upload.push(photos[filename].file);
            else if (photos[filename].status === "delete" && photos[filename].id) photos_delete.push(photos[filename].id);
        });

        await fetch(API_HOST_URL + `/quote/request/${Number(quoteRequest.id)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                customer: Number(ctx.user?.id),
                description: putDescription,
                part_preference: putPartPreference,
                availability: putAvailability,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    error = true;
                    console.log("error");
                }
                console.log(response);
                return response.json;
            })
            .then((result) => {
                if (error) {
                    console.error(result);
                }
                console.log(result);
            });

        // upload new images to db
        const upload_data = new FormData();
        photos_upload.forEach((image) => {
            upload_data.append("images", image);
        });
        await fetch(API_HOST_URL + `/quote/request/${Number(quoteRequest.id)}/image`, {
            method: "POST",
            headers: {
                Authorization: `Token ${ctx.tokens?.accessToken}`,
            },
            body: upload_data,
        })
            .then((response) => {
                if (!response.ok) {
                    error = true;
                    console.log("error");
                }
                console.log(response);
                return response.json;
            })
            .then((result) => {
                if (error) {
                    console.error(result);
                }
                console.log(result);
            });

        // delete images from db
        for (let i = 0; i < photos_delete.length; i++) {
            await fetch(API_HOST_URL + `/quote/request/${photos_delete[i]}/image`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${ctx.tokens?.accessToken}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        error = true;
                        console.log("error");
                    }
                    console.log(response);
                    return response.json;
                })
                .then((result) => {
                    if (error) {
                        console.error(result);
                    }
                    console.log(result);
                });
        }

        router.push("/quotes");
    };

    // initializes images
    const [photos, setPhotos] = useState<Dictionary<imageFile>>({});
    useEffect(() => {
        if (queryId) {
            setLoading(true);
            getQuoteRequest(Number(queryId), (result) => {
                setQuoteRequest(result.quote_request);
                const saved_photos: Dictionary<imageFile> = {};

                result.quote_request.images.forEach((image: imageFile) => {
                    saved_photos[path.basename(image.url)] = {
                        id: image.id,
                        url: process.env.NEXT_PUBLIC_API_URL + image.url,
                        size: image.size,
                    };
                });

                setPhotos(saved_photos);
                setLoading(false);
                console.log(saved_photos);
            });
        }
    }, [router.query]);

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

    return (
        <div>
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
                    </Nav>
                </Container>
            </div>

            <Container>
                <div className="my-2 p-3 bg-light rounded text-dark">
                    {!loading ? (
                        <>
                            <h5>Modify Quote Request #{quoteRequest.id}</h5>
                            <Form onSubmit={handleQuoteRequestModify} className="d-grid">
                                <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border" id="customer-section">
                                    <h5>Your Contact</h5>
                                    <div className="d-flex">
                                        <div className="flex-fill me-2">
                                            <Form.Label className="mt-2">First Name</Form.Label>
                                            <div className="border rounded p-2 bg-white">{ctx.user?.first_name}</div>
                                        </div>
                                        <div className="flex-fill">
                                            <Form.Label className="mt-2">Last Name</Form.Label>
                                            <div className="border rounded p-2 bg-white">{ctx.user?.last_name}</div>
                                        </div>
                                    </div>
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control type="text" placeholder="Email Address" readOnly defaultValue={ctx.user?.email} />
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control type="text" placeholder="Phone Number" readOnly defaultValue={ctx.user?.phone} />
                                </div>

                                <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border" id="vehicle-section">
                                    <h5>Your Vehicle Information</h5>
                                    <Form.Control
                                        disabled
                                        defaultValue={
                                            quoteRequest.vehicle.year + " " + quoteRequest.vehicle.make + " " + quoteRequest.vehicle.model
                                        }
                                    />
                                </div>

                                <div className="bg-secondary bg-secondary bg-opacity-10 p-2 my-2 rounded border" id="details-section">
                                    <h5>Service Details</h5>
                                    <Form.Control
                                        as="textarea"
                                        required
                                        rows={5}
                                        placeholder="Description of Issue(s)"
                                        defaultValue={quoteRequest.description}
                                        // look into this to make it stop refreshing on every input
                                        onChange={(e) => setModifiedDescription(e.target.value)}
                                    />
                                </div>
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

                                <Form.Label>Part Preference (if applicable)</Form.Label>
                                <Form.Select
                                    defaultValue={quoteRequest.part_preference}
                                    onChange={(e) => setModifiedPartPreference(e.target.value)}
                                >
                                    <option value="any">Any</option>
                                    <option value="new">New</option>
                                    <option value="used">Used</option>
                                    <option value="oem">OEM</option>
                                    <option value="aftermarket">Aftermarket</option>
                                </Form.Select>

                                <Form.Label>Availability</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    disabled
                                    placeholder="Specify any times available"
                                    defaultValue={quoteRequest.availability}
                                    onChange={(e) => setModifiedAvailability(e.target.value)}
                                />
                                <Button className="mt-2" type="submit">
                                    Save Changes
                                </Button>
                                <Button className="mt-2" variant="secondary" onClick={() => router.push("/quotes")}>
                                    Cancel
                                </Button>
                            </Form>
                        </>
                    ) : (
                        <div className="text-center my-5">
                            <h1 className="text-muted">
                                <i className="fa-solid fa-car-side fa-bounce text-primary" /> Loading...
                            </h1>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default QuoteRequestModify;
