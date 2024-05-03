/**
 * A component used to display the specific page of a selected shop from the shop lookup page of the application.
 */

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ShopService, Shop } from "../../components/types";
import Table from "react-bootstrap/Table";
import CustomNavBar from "../../components/navigation/navBar";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import dynamic from "next/dynamic";

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

const MapNoSSR = dynamic(() => import("../../components/common/map"), { ssr: false });

const createShop = (res: any) => {
    let s = res.success.shop;

    let shop: Shop = {
        id: s.id,
        name: s.name,
        address: s.address,
        description: s.description,
        email: s.email,
        phone: s.phone,
        hours: s.hours,
        owner: s.owner,
        services: s.services,
        employees: s.employees,
        latitude: s.latitude,
        longitude: s.longitude,
    };

    return shop;
};

const createShopServices = (res: any) => {
    let services: ShopService[] = [];

    res.services.forEach((s: any) => {
        let service: ShopService = {
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            est_time: s.est_time,
        };
        services.push(service);
    });
    return services;
};

const ShopDetails = () => {
    const router = useRouter();
    const { shopId } = router.query;
    console.log(router.query);

    let [shop, setShop] = useState({} as Shop);
    let [shopServices, setShopServices] = useState([] as ShopService[]);

    useEffect(() => {
        const getShopUrl = `${API_HOST_URL}/shop/${shopId}`;
        const getShopServicesUrl = `${API_HOST_URL}/shop/${shopId}/services`;

        const fetchShop = async () => {
            await fetch(getShopUrl)
                .then((data) => {
                    return data.json();
                })
                .then((res) => {
                    setShop(createShop(res));
                });
        };

        const fetchShopServices = async () => {
            await fetch(getShopServicesUrl)
                .then((data) => {
                    return data.json();
                })
                .then((res) => {
                    setShopServices(createShopServices(res));
                });
        };

        fetchShop().catch(console.error);
        fetchShopServices().catch(console.error);
    }, [router.asPath]);

    return (
        <div>
            <CustomNavBar />

            <Head>
                <title>Shop Details</title>
            </Head>

            <div style={{ padding: "1vw" }}>
                <h1>{shop.name}</h1>

                <hr></hr>

                <div>
                    <a href={`tel:${shop.phone}`}>{shop.phone}</a>
                </div>

                <div>
                    <a href={`mailto:${shop.email}`}>{shop.email}</a>
                </div>

                <div>
                    <p>{shop.description}</p>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-around" }}>
                <div style={{ width: "30%", padding: "1vw" }}>
                    <h4>Service List</h4>
                    <hr></hr>
                    <Table responsive size="sm" striped hover bordered variant="dark">
                        <thead>
                            <tr>
                                <th>Price</th>
                                <th>Service</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shopServices.map((service) => (
                                <OverlayTrigger placement="top" overlay={<Tooltip>{service.description}</Tooltip>}>
                                    <tr key={service.id}>
                                        <td>${service.price}</td>
                                        <td>{service.name}</td>
                                    </tr>
                                </OverlayTrigger>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <div style={{ width: "60%", padding: "1vw" }}>
                    <h4>{shop.address}</h4>
                    <hr></hr>
                    {/* <iframe
                        width="80%"
                        height="500"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=-79.94107246398927%2C43.25429892187398%2C-79.89901542663576%2C43.27358087244891&amp;layer=mapnik"
                        style={{ border: "1px solid black" }}
                    ></iframe> */}
                    <MapNoSSR center={[shop.latitude, shop.longitude]} label={shop.name} style={{ height: "50vh" }} />
                    <br />
                    <small>
                        <a href="https://www.openstreetmap.org/?mlat=43.2639&amp;mlon=-79.9200#map=16/43.2639/-79.9200">View Larger Map</a>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default ShopDetails;
