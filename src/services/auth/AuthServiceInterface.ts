import type { LoginRequest } from "@/types/login/LoginRequest"
import type { LoginResponse } from "@/types/login/LoginResponse"
import type { RegistrationRequest } from "@/types/registration/RegistrationRequest"
import type { VerificationRequest } from "@/types/registration/VerificationRequest"

export interface AuthServiceInterface {
    login(request: LoginRequest): Promise<LoginResponse>
    register(request: RegistrationRequest): Promise<void>
    verify(request: VerificationRequest): Promise<void>
}
