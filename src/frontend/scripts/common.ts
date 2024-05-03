/**
 * Common interface variables used throughout the application
 */

export interface Person {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface imageFile {
    id?: undefined | number;
    url: string;
    size: number;
    file?: File;
    status?: undefined | "new" | "delete";
}

export interface Dictionary<T> {
    [Key: string]: T;
}

export type QuoteService = {
    id?: number;
    name: string;
    description: string;
    price: number;
    est_time: string;
    comment: string;
};

export type QuoteServiceLocal = QuoteService & {
    change?: undefined | "edit" | "delete" | "new";
};