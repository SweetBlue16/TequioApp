export type RegistrationRequest = {
  email: string;
  password: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string;
  birthDate: string;
  phoneNumber?: string;
  roleId: 1 | 2;
};
