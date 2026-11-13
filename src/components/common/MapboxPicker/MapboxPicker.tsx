import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { DeliveryPointCoordinates } from '@/types/deliveryPoint/DeliveryPoint';
import styles from './MapboxPicker.module.css';

/**
 * Properties contract for the MapboxPicker component.
 */
export interface MapboxPickerProps {
  coordinates: DeliveryPointCoordinates;
  interactive?: boolean;
  onCoordinatesChange?: (coords: DeliveryPointCoordinates) => void;
  className?: string;
}

const DEFAULT_ZOOM = 15;

/**
 * Reusable Mapbox GL component serving both as an interactive coordinate picker
 * in forms and as a read-only preview thumbnail in summary screens.
 */
export const MapboxPicker: React.FC<MapboxPickerProps> = ({
  coordinates,
  interactive = true,
  onCoordinatesChange,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;

  useEffect(() => {
    if (!mapContainerRef.current || !accessToken) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coordinates.longitude, coordinates.latitude],
      zoom: DEFAULT_ZOOM,
      interactive,
      attributionControl: false,
    });

    if (interactive) {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    }

    const marker = new mapboxgl.Marker({
      color: '#D9481E', 
      draggable: interactive,
    })
      .setLngLat([coordinates.longitude, coordinates.latitude])
      .addTo(map);

    if (interactive && onCoordinatesChange) {
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        onCoordinatesChange({
          latitude: Number(lngLat.lat.toFixed(6)),
          longitude: Number(lngLat.lng.toFixed(6)),
        });
      });

      map.on('click', (event) => {
        marker.setLngLat(event.lngLat);
        onCoordinatesChange({
          latitude: Number(event.lngLat.lat.toFixed(6)),
          longitude: Number(event.lngLat.lng.toFixed(6)),
        });
      });
    }

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [accessToken, interactive]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const currentLngLat = markerRef.current.getLngLat();
    const hasMoved =
      Math.abs(currentLngLat.lat - coordinates.latitude) > 0.00001 ||
      Math.abs(currentLngLat.lng - coordinates.longitude) > 0.00001;

    if (hasMoved) {
      markerRef.current.setLngLat([coordinates.longitude, coordinates.latitude]);
      mapInstanceRef.current.flyTo({
        center: [coordinates.longitude, coordinates.latitude],
        essential: true,
      });
    }
  }, [coordinates.latitude, coordinates.longitude]);

  return (
    <div
      className={`${styles.mapWrapper} ${className}`.trim()}
      aria-label={
        interactive
          ? 'Selector interactivo de ubicación en el mapa'
          : 'Vista previa de ubicación en el mapa'
      }
    >
      {!accessToken ? (
        <div className={styles.errorState}>
          Falta configurar VITE_MAPBOX_ACCESS_TOKEN en tu archivo .env.local
        </div>
      ) : (
        <>
          <div ref={mapContainerRef} className={styles.mapCanvas} />
          {interactive && (
            <span className={styles.helperBadge}>
              Haz clic en el mapa o arrastra el marcador
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default MapboxPicker;