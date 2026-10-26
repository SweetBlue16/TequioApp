import axios from 'axios';
import { TokenStorage } from '../TokenStorage';
import { attachAuthInterceptors } from '../attachAuthInterceptors';

test('adjunta Bearer y un 401 limpia el token', async () => {
  const storage = new TokenStorage();
  storage.setToken('token-de-prueba');
  const client = axios.create({ adapter: async (request) => {
    expect(request.headers.Authorization).toBe('Bearer token-de-prueba');
    throw { response: { status: 401 } };
  } });
  attachAuthInterceptors(client, storage);
  await expect(client.get('/users/me')).rejects.toBeDefined();
  expect(storage.getToken()).toBeNull();
});
