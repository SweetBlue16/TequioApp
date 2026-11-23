import { getMapboxAccessToken } from '@/config/mapbox';
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { DeliveryPointCoordinates } from '@/types/deliveryPoint/DeliveryPoint';
import pinIcon from '@/assets/icons/common/icon_maps.png';
import styles from './MapboxPicker.module.css';

/**
 * Geographic bounding box formatted as [[minLng, minLat], [maxLng, maxLat]].
 */
export type GeographicBounds = readonly [readonly [number, number], readonly [number, number]];

/**
 * Properties contract for the MapboxPicker component.
 */
export interface MapboxPickerProps {
  /** Current geographic coordinates displayed by the pin */
  coordinates: DeliveryPointCoordinates;
  /** Enables dragging the marker and clicking on the map to adjust location */
  interactive?: boolean;
  /** Optional bounding box restricting map navigation to an authorized region */
  maxBounds?: GeographicBounds;
  /** Callback triggered when the user repositions the marker */
  onCoordinatesChange?: (coordinates: DeliveryPointCoordinates) => void;
}

/**
 * Reusable Mapbox GL JS map wrapper displaying a custom Tequio location pin.
 */
export const MapboxPicker: React.FC<MapboxPickerProps> = ({
  coordinates,
  interactive = false,
  maxBounds,
  onCoordinatesChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const accessToken = getMapboxAccessToken();

  const hasValidCoordinates =
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    Math.abs(coordinates.latitude) <= 90 &&
    Math.abs(coordinates.longitude) <= 180;
  const changeHandlerRef = useRef(onCoordinatesChange);
  useEffect(() => {
    changeHandlerRef.current = onCoordinatesChange;
  }, [onCoordinatesChange]);

  useEffect(() => {
    if (!containerRef.current || !accessToken || !hasValidCoordinates) {
      return;
    }

    mapboxgl.accessToken = accessToken;

    const mapInstance = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coordinates.longitude, coordinates.latitude],
      zoom: 15,
      interactive,
      maxBounds: maxBounds
        ? [
            [maxBounds[0][0], maxBounds[0][1]],
            [maxBounds[1][0], maxBounds[1][1]],
          ]
        : undefined,
    });

    const markerElement = document.createElement('img');
    markerElement.src = pinIcon;
    markerElement.alt = 'Ubicación del punto de entrega';
    markerElement.style.width = '36px';
    markerElement.style.height = '36px';
    markerElement.style.objectFit = 'contain';
    markerElement.style.cursor = interactive ? 'grab' : 'default';

    const markerInstance = new mapboxgl.Marker({
      element: markerElement,
      draggable: interactive,
      anchor: 'bottom',
    })
      .setLngLat([coordinates.longitude, coordinates.latitude])
      .addTo(mapInstance);

    if (interactive) {
      markerInstance.on('dragend', () => {
        const lngLat = markerInstance.getLngLat();
        changeHandlerRef.current?.({
          latitude: Number(lngLat.lat.toFixed(6)),
          longitude: Number(lngLat.lng.toFixed(6)),
        });
      });

      mapInstance.on('click', (event) => {
        markerInstance.setLngLat(event.lngLat);
        changeHandlerRef.current?.({
          latitude: Number(event.lngLat.lat.toFixed(6)),
          longitude: Number(event.lngLat.lng.toFixed(6)),
        });
      });
    }

    mapRef.current = mapInstance;
    markerRef.current = markerInstance;

    return () => {
      markerInstance.remove();
      mapInstance.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, accessToken, hasValidCoordinates]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !hasValidCoordinates) {
      return;
    }

    markerRef.current.setLngLat([coordinates.longitude, coordinates.latitude]);
    mapRef.current.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      essential: true,
    });
  }, [coordinates.latitude, coordinates.longitude, hasValidCoordinates]);

  if (!accessToken) {
    return (
      <div className={styles.mapWrapper}>
        <div className={styles.errorState}>
          El mapa no está disponible. Puedes continuar con los datos de ubicación.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapWrapper}>
      <section
        ref={containerRef}
        className={styles.mapCanvas}
        aria-label="Mapa de ubicación del punto de entrega"
      />
      {interactive && (
        <span className={styles.helperBadge}>Arrastra el marcador o haz clic en el mapa</span>
      )}
    </div>
  );
};

export default MapboxPicker;
