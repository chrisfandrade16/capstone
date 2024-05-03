/**
 * Various states that are used throughout the application for API calls, etc.
 */

import React, { createContext, useContext, useState } from "react";

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    phone: string;
}

interface Tokens {
    accessToken: string;
    refreshToken: string;
    authStatus: string;
}

export interface Shop {
    id: string;
    owner: number;
    email: string;
    name: string;
    address: string;
    phone: string;
    description: string;
    hours: string | null;
    employees: Array<Employee>;
    services: Array<ShopService>;
}

export interface Employee {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    salary: number;
}

export interface ShopService {
    id: string;
    name: string;
    description: string;
    price: string;
    est_time: any;
    canned: boolean;
}

export interface Service {
    id: string;
    name: string;
    description: string;
}

export interface AppContextInterface {
    user: User | null;
    tokens: Tokens | null;
    shop: Shop | null;
    services: Array<Service> | null;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    setTokens: React.Dispatch<React.SetStateAction<any>>;
    setShop: React.Dispatch<React.SetStateAction<any>>;
    setServices: React.Dispatch<React.SetStateAction<any>>;
}

const AppContext = createContext<AppContextInterface>({
    user: null,
    tokens: null,
    shop: null,
    services: null,
    setUser: () => { },
    setTokens: () => { },
    setShop: () => { },
    setServices: () => { },
});

export const AppWrapper: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [user, setUser] = useState(null);
    const [tokens, setTokens] = useState(null);
    const [shop, setShop] = useState(null);
    const [services, setServices] = useState(null);

    const states = {
        user,
        setUser,
        tokens,
        setTokens,
        shop,
        setShop,
        services,
        setServices,
    };

    return <AppContext.Provider value={states}>{children}</AppContext.Provider>;
};

export function useAppContext() {
    return useContext(AppContext);
}
