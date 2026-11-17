import { act, renderHook } from '@testing-library/react';
import { reverseGeocodeCoordinates } from '@/utils/deliveryPointGeocoding';
import type { ResolvedMapAddress } from '@/utils/deliveryPointGeocoding';
import { useDeliveryPointWizard } from '../useDeliveryPointWizard';

jest.mock('@/utils/deliveryPointGeocoding', () => ({
  ...jest.requireActual('@/utils/deliveryPointGeocoding'),
  reverseGeocodeCoordinates: jest.fn(),
}));

jest.mock('@/config/mapbox', () => ({ getMapboxAccessToken: () => undefined }));

describe('The delivery wizard keeps the form and selected coordinates in sync', () => {
  beforeEach(() => jest.resetAllMocks());
  it('submits the location chosen on the map even when geocoding is unavailable', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useDeliveryPointWizard(undefined, onSubmit));
    await act(async () => result.current.updateCoordinates({ latitude: 19.54, longitude: -96.93 }));
    expect(result.current.formData.latitude).toBe(19.54);
    expect(result.current.formData.longitude).toBe(-96.93);
    act(() => result.current.confirmSubmit());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ latitude: 19.54, longitude: -96.93 }));
  });

  it('keeps the newest selected location when an older geocoding request finishes later', async () => {
    let resolveFirst!: (address: ResolvedMapAddress) => void;
    const firstAddress = new Promise<ResolvedMapAddress>((resolve) => { resolveFirst = resolve; });
    const firstCoordinates = { latitude: 19.54, longitude: -96.93 };
    const latestCoordinates = { latitude: 19.55, longitude: -96.94 };
    jest.mocked(reverseGeocodeCoordinates)
      .mockReturnValueOnce(firstAddress)
      .mockResolvedValueOnce({ coordinates: latestCoordinates, street: 'Nueva calle' });
    const { result } = renderHook(() => useDeliveryPointWizard(undefined, jest.fn()));
    let firstRequest!: Promise<void>;
    act(() => { firstRequest = result.current.updateCoordinates(firstCoordinates); });
    await act(async () => result.current.updateCoordinates(latestCoordinates));
    await act(async () => {
      resolveFirst({ coordinates: firstCoordinates, street: 'Calle anterior' });
      await firstRequest;
    });
    expect(result.current.formData).toEqual(expect.objectContaining({ ...latestCoordinates, street: 'Nueva calle' }));
  });

});
