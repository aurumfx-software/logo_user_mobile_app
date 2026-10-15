import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export default function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    let active = true;

    (async () => {
      setStatus('loading');
      try {
        const { status: permission } = await Location.requestForegroundPermissionsAsync();
        if (permission !== 'granted') {
          if (active) setStatus('denied');
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        let city = null;
        let region = null;
        try {
          const [place] = await Location.reverseGeocodeAsync(position.coords);
          city = place?.city || place?.subregion || place?.district || null;
          region = place?.region || place?.country || null;
        } catch {
          // Reverse geocode is optional; coordinates are enough for distance.
        }

        if (active) {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city,
            region,
            label: city || region || 'Your location',
          });
          setStatus('granted');
        }
      } catch {
        if (active) setStatus('error');
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { location, status };
}
