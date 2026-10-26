import type { LoginRequest } from "@/types/login/LoginRequest"
import type { LoginResponse } from "@/types/login/LoginResponse"
import type { PasswordRecoveryRequest } from "@/types/passwordRecovery/PasswordRecoveryRequest"
import type { ResetPasswordRequest } from "@/types/passwordRecovery/ResetPasswordrequest"
import type { RegistrationRequest } from "@/types/registration/RegistrationRequest"
import type { VerificationRequest } from "@/types/registration/VerificationRequest"

export interface AuthServiceInterface {
    login(request: LoginRequest): Promise<LoginResponse>
    register(request: RegistrationRequest): Promise<void>
    verify(request: VerificationRequest): Promise<void>
    requestPasswordReset(request: PasswordRecoveryRequest): Promise<void>;
    resetPassword(request: ResetPasswordRequest): Promise<void>;
}
