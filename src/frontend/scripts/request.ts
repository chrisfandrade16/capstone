const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

export const AFFLIATED_URL_WITH_ID = (id: string) => `/affiliated/${id}`;

export const SHOP_URL = "/shop";

export const SHOP_URL_WITH_ID = (id: string) => `${SHOP_URL}/${id}`;

export const SHOPS_URL = "/shops";

export const SERVICE_URL = "/service/";

export const SHOP_SERVICE_URL_WITH_ID = (id: string) => `/shop/${id}/services`;

export const EMPLOYEE_URL = "/employees";

export const EMPLOYEE_URL_WITH_ID = (id: string) => `${EMPLOYEE_URL}/${id}`;

export const ACTIVATE_URL = "/auth/users/reset_username/";

export const WORKORDER_URL = "/workorder";

export const WORKORDER_URL_WITH_ID = (id: string) => `/workorder/${id}`;

export enum METHOD_TYPES {
    CREATE = "POST",
    READ = "GET",
    UPDATE = "PUT",
    DELETE = "DELETE",
}

export const request = async (url: string, method: METHOD_TYPES | null, body: any, ctx:any=undefined) => {
    const parameters: any = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (ctx?.tokens?.accessToken)
        parameters.headers["Authorization"] = `Token ${ctx.tokens?.accessToken}`;
    if (method) {
        parameters.method = method;
    }

    if (body) {
        parameters.body = JSON.stringify(body);
    }

    console.log(url);

    console.log(parameters);

    const response = await fetch(`${API_HOST_URL}${url}`, parameters);

    console.log(response);

    const text = await response.text();

    console.log(text);

    let result: any;

    try {
        if (text) {
            result = await JSON.parse(text);
        } else {
            result = {};
        }
    } catch (error) {
        result = {
            failure: "The response could not be parsed.",
        };
    }

    console.log(result);

    if (result.failure) {
        if (typeof result.failure == "object")
            result = {
                failure: Object.keys(result.failure)
                    .map((key) => `${key}: ${result.failure[key]}`)
                    .join(" "),
            };
    } else if (!result.success) {
        if (Object.values(result).length > 0) {
            if ("0" in result) {
                result = {
                    success: {
                        data: Object.values(result),
                    },
                };
            } else {
                result = {
                    success: { ...result },
                };
            }
        } else {
            result = { success: "Request sent successfully with no response." };
        }
    }

    console.log(result);

    return result;
};
