import axios, { type AxiosInstance } from "axios";
import type { TokenStorageInterface } from "./auth/TokenStorageInterface";


export const createClient = (tokenStorage: TokenStorageInterface) : AxiosInstance => {
    const client = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        timeout: 10000, // 10 seconds timeout
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    });

    client.interceptors.request.use(
        (config) => {
            const token = tokenStorage.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
        (response) => response,
        (error) => {
        if (error.response?.status === 401) {
            tokenStorage.clearToken();
            // todo: Trigger external redirect or event dispatcher here
        }
        return Promise.reject(error);
        }
    );

    return client;
}
