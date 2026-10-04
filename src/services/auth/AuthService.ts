import type { AuthServiceInterface } from "@/services/auth/AuthServiceInterface";
import type { TokenStorageInterface } from "./TokenStorageInterface";
import type { LoginRequest } from "@/types/login/LoginRequest";
import type { LoginResponse } from "@/types/login/LoginResponse";
import type { RegistrationRequest } from "@/types/registration/RegistrationRequest";
import type { VerificationRequest } from "@/types/registration/VerificationRequest";
import type { AxiosInstance } from "axios";

export class AuthService implements AuthServiceInterface {
    private readonly serviceBaseUrl = "/auth";
    private readonly client: AxiosInstance;
    private readonly tokenStorage: TokenStorageInterface;

    constructor(
        client: AxiosInstance,
        tokenStorage: TokenStorageInterface
    ) {
        this.client = client;
        this.tokenStorage = tokenStorage;
    }

    async login(request: LoginRequest): Promise<LoginResponse> {
        const response = await this.client.post<LoginResponse>(`${this.serviceBaseUrl}/login`, request);
        if (response.data.token) {
            this.tokenStorage.setToken(response.data.token);
        }
        return response.data;
    }

    async register(request: RegistrationRequest): Promise<void> {
        await this.client.post(`${this.serviceBaseUrl}/register`, request);
    }

    async verify(request: VerificationRequest): Promise<void> {
        await this.client.post(`${this.serviceBaseUrl}/verify`, request);
    }
}
