import axios, { type AxiosInstance } from "axios";
import type { TokenStorageInterface } from "./auth/TokenStorageInterface";
import { attachAuthInterceptors } from './auth/attachAuthInterceptors';


export const createClient = (tokenStorage: TokenStorageInterface) : AxiosInstance => {
    const client = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        timeout: 30000, // 30 seconds timeout
        headers: {
            Accept: "application/json",
        }
    });

    attachAuthInterceptors(client, tokenStorage);

    return client;
}
