import type { AxiosInstance } from 'axios';
import { ProfileService } from '../ProfileService';

test('envía FormData con el campo file y usa la URL para asociar foto', async () => {
  const post = jest.fn().mockResolvedValue({ data: { url: 'https://example.test/foto.jpg' } });
  const put = jest.fn().mockResolvedValue({});
  const service = new ProfileService({ post, put } as unknown as AxiosInstance);
  const image = new File(['image'], 'foto.png', { type: 'image/png' });
  const url = await service.uploadImage(image);
  expect(post).toHaveBeenCalledWith('/files/image', expect.any(FormData));
  const body = post.mock.calls[0][1] as FormData;
  expect(body.get('file')).toBe(image);
  expect(post.mock.calls[0]).toHaveLength(2); // no Content-Type forced; browser sets boundary
  await service.updatePicture(url);
  expect(put).toHaveBeenCalledWith('/users/me/profile-picture', { pictureUrl: url });
});
