
const ROLE_ID = {
    BUYER: 1,
    PRODUCER: 2
}

export type RegistrationRequest = {
    email: string;
    password: string;
    firstName: string;
    paternalLastName: string;
    maternalLastName?: string;
    birthDate: string;
    phoneNumber?: string;
    roleId: typeof ROLE_ID[keyof typeof ROLE_ID];
}
