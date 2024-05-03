/**
 * Authentication API calls for the application. 
 */

import { AppContextInterface } from "../context/state";

const API_HOST_URL = process.env.NEXT_PUBLIC_API_URL;

export const getUserProfile = async (
    ctx: AppContextInterface,
    token: string
) => {
    // fetch profile details
    const response = await fetch(API_HOST_URL + "/account/me", {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
//<<<<<<< HEAD
    });
    const result = await response.json();
    console.log(result);
    ctx.setUser({
        id: result.profile.user.id,
        username: result.profile.user.username,
        email: result.profile.user.email,
        role: result.profile.user.role,
        first_name: result.profile.user.first_name,
        last_name: result.profile.user.last_name,
        phone: result.profile.phone,
    });
    localStorage.setItem("id", result.profile.user.id);
    localStorage.setItem("email", result.profile.user.email);
    localStorage.setItem("username", result.profile.user.username);
    localStorage.setItem("role", result.profile.user.role);
    localStorage.setItem("first_name", result.profile.user.first_name);
    localStorage.setItem("last_name", result.profile.user.last_name);
    localStorage.setItem("phone", result.profile.phone);
    return result.profile.user;
/*=======
    })
        .then((response) => {
            console.log(response);
            return response.json();
        })
        .then((result) => {
            console.log(result);
            ctx.setUser({
                id: result.profile.user.id,
                username: result.profile.user.username,
                email: result.profile.user.email,
                role: result.profile.user.role,
                first_name: result.profile.user.first_name,
                last_name: result.profile.user.last_name,
                phone: result.profile.phone,
            });
            localStorage.setItem("id", result.profile.user.id);
            localStorage.setItem("email", result.profile.user.email);
            localStorage.setItem("username", result.profile.user.username);
            localStorage.setItem("role", result.profile.user.role);
            localStorage.setItem("first_name", result.profile.user.first_name);
            localStorage.setItem("last_name", result.profile.user.last_name);
            localStorage.setItem("phone", result.profile.phone);
        });
>>>>>>> 480fe4d (Merge of branch 'main')*/
};

export const login = (
    ctx: AppContextInterface,
    username: string,
    password: string,
    successCallback: any = undefined,
    failCallback: any = undefined
) => {
    let error = false;
    fetch(API_HOST_URL + "/auth/jwt/create/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                error = true;
            }
            return response.json();
        })
        .then((result) => {
            console.log(result);
            if (error) {
                console.error(result);
                logout(ctx);
                if (failCallback) failCallback(result);
            } else {
                ctx.setTokens({
                    accessToken: result.access,
                    refreshToken: result.refresh,
                    authStatus: "signed-in",
                });
                localStorage.setItem("accessToken", result.access);
                localStorage.setItem("refreshToken", result.refresh);

                if (successCallback) successCallback(result);
            }
        });
};

export const logout = (ctx: AppContextInterface) => {
    ctx.setUser(null);
    resetTokens(ctx);
    clearSavedUser();
};

export const resetTokens = (ctx: AppContextInterface) => {
    ctx.setTokens({
        accessToken: "",
        refreshToken: "",
        authStatus: "signed-out",
    });
};

export const loadSavedUser = () => {
    return {
        id: localStorage.getItem("id"),
        username: localStorage.getItem("username"),
        email: localStorage.getItem("email"),
        role: localStorage.getItem("role"),
        first_name: localStorage.getItem("first_name"),
        last_name: localStorage.getItem("last_name"),
        phone: localStorage.getItem("phone"),
    };
};

const clearSavedUser = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    localStorage.removeItem("username");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("phone");
};

export const verifyTokens = (ctx: AppContextInterface, token: string) => {
    const refreshToken = localStorage.getItem("refreshToken");
    fetch(API_HOST_URL + "/auth/jwt/verify/", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token }),
    })
        .then((response) => {
            if (!response.ok) {
                console.log(response);
                throw response.statusText;
            }
            return response.json();
        })
        .then((result) => {
            console.log("success");
            console.log("SETTING TOKENS");
            ctx.setTokens({
                accessToken: token,
                refreshToken: refreshToken,
                authStatus: "signed-in",
            });
            ctx.setUser(loadSavedUser());
        })
        .catch((err) => {
            // invalid token
            console.log("outdated or invalid token, attempting to refresh");
            console.error(err);

            updateTokens(ctx, refreshToken ?? "");
        });
};

export const updateTokens = (ctx: AppContextInterface, token: string) => {
    fetch(API_HOST_URL + "/auth/jwt/refresh/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: token }),
    })
        .then((response) => {
            if (!response.ok) {
                throw response.statusText;
            }
            return response.json();
        })
        .then((result) => {
            console.log("Token refreshed successfully");
            localStorage.setItem("accessToken", result.access);
            ctx.setTokens({
                accessToken: result.access,
                refreshToken: localStorage.getItem("refreshToken"),
                authStatus: "signed-in",
            });
            ctx.setUser(loadSavedUser());
        })
        .catch((err) => {
            // invalid refresh token
            console.log("outdated or invalid refresh token, clearing storage");
            console.error(err);

            // try refresh token

            clearSavedUser();
            resetTokens(ctx);
        });
};

export const register = (
    data: FormData,
    successCallback: any = undefined,
    failCallback: any = undefined
) => {
    let ok: boolean;
    fetch(API_HOST_URL + "/auth/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: (data.get("username") as string).toLowerCase(),
            password: data.get("password"),
            email: data.get("email"),
            first_name: data.get("firstName"),
            last_name: data.get("lastName"),
            phone: data.get("phone"),
            role: data.get("role"),
        }),
    })
        .then((response) => {
            ok = response.ok;
            return response.json();
        })
        .then((result) => {
            if (!ok) throw result;

            console.log(result);
            if (successCallback) successCallback(result);
        })
        .catch((err) => {
            console.error(err);
            if (failCallback) failCallback(err);
        });
};

// initiates a password reset, calls the backend to send reset email
export const initiateReset = (
    data: FormData,
    successCallback: any = undefined,
    failCallback: any = undefined
) => {
    let ok: boolean;
    fetch(API_HOST_URL + "/auth/users/reset_password/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: data.get("email"),
        }),
    })
        .then((response) => {
            ok = response.ok && response.status === 204;
            if (!ok) throw response.statusText;
            if (successCallback) successCallback(response.text);
        })
        .catch((err) => {
            console.error(err);
            if (failCallback) failCallback(err);
        });
};

// confirms a password reset using uid, token, password
export const confirmReset = (
    uid: string,
    token: string,
    password: string,
    successCallback: any = undefined,
    failCallback: any = undefined
) => {
    let ok: boolean;
    fetch(API_HOST_URL + "/auth/users/reset_password_confirm/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: uid,
            token: token,
            new_password: password,
        }),
    })
        .then((response) => {
            ok = response.ok && response.status === 204;
            if (!ok) throw response.statusText;
            if (successCallback) successCallback(response.text);
        })
        .catch((err) => {
            console.error(err);
            if (failCallback) failCallback(err);
        });
};

// validates reset password uid and token before displaying reset page
export const validateResetRequest = (
    uid: string,
    token: string,
    successCallback: any = undefined,
    failCallback: any = undefined
) => {
    let ok: boolean;
    fetch(API_HOST_URL + "/auth/validate_reset/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: uid,
            token: token,
        }),
    })
        .then((response) => {
            ok = response.ok && response.status === 204;
            if (!ok) throw response.statusText;
            if (successCallback) successCallback(response.text);
        })
        .catch((err) => {
            console.error(err);
            if (failCallback) failCallback(err);
        });
};
