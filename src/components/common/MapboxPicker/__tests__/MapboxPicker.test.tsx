import { act, render, screen } from '@testing-library/react';
import mapboxgl from 'mapbox-gl';
import { getMapboxAccessToken } from '@/config/mapbox';
import { MapboxPicker } from '../MapboxPicker';

jest.mock('@/config/mapbox', () => ({ getMapboxAccessToken: jest.fn() }));
jest.mock('mapbox-gl', () => ({
  __esModule: true,
  default: { Map: jest.fn(), Marker: jest.fn() },
}));

describe('MapboxPicker displays and edits a delivery location', () => {
  let map: { on: jest.Mock; flyTo: jest.Mock; remove: jest.Mock };
  let marker: { on: jest.Mock; setLngLat: jest.Mock; addTo: jest.Mock; getLngLat: jest.Mock; remove: jest.Mock };
  let mapEvents: Record<string, (event: { lngLat: { lat: number; lng: number } }) => void>;
  let markerEvents: Record<string, () => void>;
  const coordinates = { latitude: 19.53, longitude: -96.92 };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getMapboxAccessToken).mockReturnValue('TEST_TOKEN');
    mapEvents = {};
    markerEvents = {};
    map = { on: jest.fn((event, handler) => { mapEvents[event] = handler; }), flyTo: jest.fn(), remove: jest.fn() };
    marker = {
      on: jest.fn((event, handler) => { markerEvents[event] = handler; }),
      setLngLat: jest.fn().mockReturnThis(), addTo: jest.fn().mockReturnThis(),
      getLngLat: jest.fn(() => ({ lat: 19.55, lng: -96.94 })), remove: jest.fn(),
    };
    (mapboxgl.Map as unknown as jest.Mock).mockImplementation(() => map);
    (mapboxgl.Marker as unknown as jest.Mock).mockImplementation(() => marker);
  });

  it('creates the accessible map and marker at the supplied coordinates', () => {
    render(<MapboxPicker coordinates={coordinates} />);
    expect(screen.getByRole('region', { name: 'Mapa de ubicación del punto de entrega' })).toBeInTheDocument();
    expect(mapboxgl.Map).toHaveBeenCalledWith(expect.objectContaining({ center: [-96.92, 19.53], interactive: false }));
    expect(marker.setLngLat).toHaveBeenCalledWith([-96.92, 19.53]);
  });

  it('propagates click and drag selections to the form callback', () => {
    const onChange = jest.fn();
    render(<MapboxPicker coordinates={coordinates} interactive onCoordinatesChange={onChange} />);
    act(() => mapEvents.click({ lngLat: { lat: 19.54, lng: -96.93 } }));
    expect(marker.setLngLat).toHaveBeenCalledWith({ lat: 19.54, lng: -96.93 });
    expect(onChange).toHaveBeenLastCalledWith({ latitude: 19.54, longitude: -96.93 });
    act(() => markerEvents.dragend());
    expect(onChange).toHaveBeenLastCalledWith({ latitude: 19.55, longitude: -96.94 });
  });

  it('synchronizes new form coordinates and uses the latest callback without recreating the map', () => {
    const oldCallback = jest.fn();
    const nextCallback = jest.fn();
    const { rerender } = render(<MapboxPicker coordinates={coordinates} interactive onCoordinatesChange={oldCallback} />);
    rerender(<MapboxPicker coordinates={{ latitude: 0, longitude: 0 }} interactive onCoordinatesChange={nextCallback} />);
    expect(marker.setLngLat).toHaveBeenLastCalledWith([0, 0]);
    expect(map.flyTo).toHaveBeenLastCalledWith({ center: [0, 0], essential: true });
    act(() => markerEvents.dragend());
    expect(nextCallback).toHaveBeenCalled();
    expect(oldCallback).not.toHaveBeenCalled();
    expect(mapboxgl.Map).toHaveBeenCalledTimes(1);
  });

  it('keeps the page usable without Mapbox configuration', () => {
    jest.mocked(getMapboxAccessToken).mockReturnValue(undefined);
    render(<MapboxPicker coordinates={coordinates} />);
    expect(screen.getByText(/El mapa no está disponible/)).toBeInTheDocument();
    expect(mapboxgl.Map).not.toHaveBeenCalled();
  });

  it('does not attach editing handlers to a read only map and releases resources on unmount', () => {
    const onChange = jest.fn();
    const { unmount } = render(<MapboxPicker coordinates={coordinates} onCoordinatesChange={onChange} />);
    expect(map.on).not.toHaveBeenCalled();
    expect(marker.on).not.toHaveBeenCalled();
    unmount();
    expect(marker.remove).toHaveBeenCalledTimes(1);
    expect(map.remove).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
