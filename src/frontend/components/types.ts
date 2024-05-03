/**
 * Various types that are used for different pages on the application for API calls, etc.
 */

export interface Shop {
    id: number,
    name: string,
    address: string,
    description: string,
    email: string,
    phone: string,
    hours: string,
    owner: number
    services: Array<number>,
    employees: Array<number>
    latitude: number,
    longitude: number
}

export interface ShopService {
    id: number,
    name: string,
    description: string,
    price: string,
    est_time: string
}

export interface Service {
    id: number,
    name: string,
    description: string
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
}

export interface Address {
    street: string,
    city: string,
    postalCode: string,
    country: string
}

export interface Makes {
    id: number,
    name: string,
    slug: string,
    models: {
        id: number,
        name: string,
        vehicle_type: string,
        years: string[]
    }
}

export interface Models {
    id: number,
    name: string,
    vehicle_type: string,
    years: string[]
}

export interface Vehicle {
    id: number,
    make: string,
    model: string,
    year: number,
    vin: string,
    plate_number: string,
    owner: {
        first_name: string,
        last_name: string,
        email: string,
        phone: string,
        address: string
    }
}

export interface QuoteRequest {
    id: number,
    customer: {
        id?: number,
        first_name: string,
        last_name: string,
        email: string,
        phone: string,
        address: string,
    },
    description: string,
    vehicle: {
        id: number,
        make: number,
        model: number,
        year: number,
        vin: string,
        plate_number: string,
        owner: string
    }
    part_preference: string,
    availability: string,
    quote_set: [],
    shop: Shop
}

export interface Quote {
    id: number;
    shop: Shop;
    quote_request: QuoteRequest;
    priority: string;
    status: string;
    message: string;
    services: ShopService[];
    buid: string;
    created_at?: string;
    new?: boolean;
}

export interface User {
    first_name?: string,
    last_name?: string,
    email?: string,
    phone?: string,
    address?: string
}

export interface Reservation {
    id?: string;
    time: string;
    schedule: number;
    state?: string;
    duration: string;
}

export interface Appointment {
    id: number;
    title: string;
    description: string;
    reservation: Reservation; // ISO-8601 date string
    time_estimate: string;
    quote: number; // ID of associated Quote model
    price_estimate: number;
    message: string;
    shop: number; // ID of associated Shop model
    customer: number; // ID of associated Customer model
}

export interface WorkOrder {
    id: number;
    appointment: Appointment;
    status: string;
    services: Array<ShopService>;
    work_description: string;
    note: string;
}

type SimpleShop = Pick<Shop, "id" | "name" | "address" | "phone">

export interface AppointmentDetail extends Omit<Appointment, "shop" | "customer" | "quote" | "reservation"> {
    shop: SimpleShop;
    customer: User;
    quote: Quote;
    reservation: Reservation; // ISO-8601 date string
}

type Event = {
    start: Date;
    end: Date;
    title: string;
    resourceId?: number;
};

type Resource = {
    id: number;
    title: string;
};

// interface EmployeeResource extends Resource {}
// interface WorkbayResource extends Resource {}

export type { Event, Resource };