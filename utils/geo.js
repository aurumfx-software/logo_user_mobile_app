import { slugify } from '../services/api';

const EARTH_RADIUS_KM = 6371;

export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(km) {
  if (km == null || Number.isNaN(km)) return '';
  if (km < 1) return `${Math.max(100, Math.round(km * 1000))} m`;
  return `${km.toFixed(1)} km`;
}

export function withDistanceFromUser(merchants, userCoords) {
  if (!userCoords) return merchants;
  return merchants.map((m) => {
    if (m.latitude == null || m.longitude == null) {
      return { ...m, distanceKm: null };
    }
    const distanceKm = getDistanceKm(
      userCoords.latitude,
      userCoords.longitude,
      m.latitude,
      m.longitude
    );
    return {
      ...m,
      distanceKm,
      distance: formatDistanceKm(distanceKm),
    };
  });
}

export function sortByDistance(merchants) {
  return [...merchants].sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return 0;
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}

export function derivePlacesNearUser(merchants = [], userCoords, limit = 12) {
  const map = {};
  merchants.forEach((m) => {
    if (!m.city) return;
    const key = m.city.trim();
    if (!map[key]) {
      map[key] = {
        id: slugify(key),
        name: key,
        district: m.district || '',
        businessCount: 0,
        image: m.photos?.[0] || m.image,
        latSum: 0,
        lngSum: 0,
        coordCount: 0,
      };
    }
    map[key].businessCount += 1;
    if (m.latitude != null && m.longitude != null) {
      map[key].latSum += m.latitude;
      map[key].lngSum += m.longitude;
      map[key].coordCount += 1;
    }
  });

  let places = Object.values(map).map((p) => {
    const { latSum, lngSum, coordCount, district, ...rest } = p;
    let distanceKm = null;
    if (userCoords && coordCount > 0) {
      distanceKm = getDistanceKm(
        userCoords.latitude,
        userCoords.longitude,
        latSum / coordCount,
        lngSum / coordCount
      );
    }
    const baseSubtitle = district ? `${district} District` : 'Kerala';
    return {
      ...rest,
      distanceKm,
      subtitle:
        distanceKm != null
          ? `${formatDistanceKm(distanceKm)} away · ${p.businessCount} businesses`
          : `${baseSubtitle} · ${p.businessCount} businesses`,
    };
  });

  if (userCoords) {
    places.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) {
        return b.businessCount - a.businessCount;
      }
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  } else {
    places.sort((a, b) => b.businessCount - a.businessCount);
  }

  return places.slice(0, limit);
}

/** Match merchants by town, district, or address (case-insensitive). */
export function filterMerchantsByArea(merchants, areaName) {
  if (!areaName || String(areaName).toLowerCase() === 'kerala') return merchants;
  const q = String(areaName).toLowerCase().trim();
  return merchants.filter((m) => {
    const hay = [m.city, m.district, m.address, m.distance, m.landmark]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

function pickNearbyFromPool(merchants, userCoords, limit) {
  const sorted = sortByDistance(withDistanceFromUser(merchants, userCoords));
  const withCoords = sorted.filter((b) => b.distanceKm != null);
  if (withCoords.length > 0) {
    return withCoords.slice(0, limit);
  }
  if (userCoords?.city) {
    const city = userCoords.city.toLowerCase();
    return merchants
      .filter((b) => b.city && b.city.toLowerCase() === city)
      .slice(0, limit);
  }
  return merchants.slice(0, limit);
}

/**
 * Nearby merchants for home — prefers area pool, then backfills to `min` from `fallbackMerchants`.
 * @param {number|{ limit?: number, min?: number, fallbackMerchants?: array }} limitOrOptions
 */
export function pickNearbyBusinesses(merchants, userCoords, limitOrOptions = 10) {
  const opts =
    typeof limitOrOptions === 'number'
      ? { limit: limitOrOptions, min: 4, fallbackMerchants: null }
      : {
          limit: limitOrOptions.limit ?? 10,
          min: limitOrOptions.min ?? 4,
          fallbackMerchants: limitOrOptions.fallbackMerchants ?? null,
        };
  const { limit, min, fallbackMerchants } = opts;

  let result = pickNearbyFromPool(merchants, userCoords, limit);
  const seen = new Set(result.map((b) => b.id));

  const appendFrom = (pool) => {
    if (!pool?.length || result.length >= min) return;
    const remaining = pool.filter((b) => !seen.has(b.id));
    if (!remaining.length) return;
    const need = Math.min(limit - result.length, min - result.length);
    const extra = pickNearbyFromPool(remaining, userCoords, need);
    extra.forEach((b) => {
      seen.add(b.id);
      result.push(b);
    });
    if (result.length < min) {
      for (const b of remaining) {
        if (seen.has(b.id)) continue;
        seen.add(b.id);
        result.push(b);
        if (result.length >= min || result.length >= limit) break;
      }
    }
  };

  if (result.length < min && fallbackMerchants && fallbackMerchants !== merchants) {
    appendFrom(fallbackMerchants);
  }
  if (result.length < min) {
    appendFrom(merchants);
  }

  return result.slice(0, limit);
}
