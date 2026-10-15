// Logo App - Public API client (user-facing endpoints only)
// Mirrors the web app's merchantApi / categoryApi / promotionApi,
// and normalizes responses into the shapes the mobile UI already uses.

export const API_BASE_URL = 'https://168.144.18.149.sslip.io';
const API_V1 = `${API_BASE_URL}/api/v1`;

const PALETTE = [
  { color: '#6C63FF', bgColor: '#F0EFFF' },
  { color: '#FF6B6B', bgColor: '#FFE8E8' },
  { color: '#4CAF50', bgColor: '#E8F5E9' },
  { color: '#FFB946', bgColor: '#FFF3E0' },
  { color: '#00BCD4', bgColor: '#E0F7FA' },
  { color: '#E91E63', bgColor: '#FCE4EC' },
  { color: '#607D8B', bgColor: '#ECEFF1' },
];

export const slugify = (s = '') =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const formatMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (/^(https?:|data:)/.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const extractList = (res, ...keys) => {
  if (Array.isArray(res)) return res;
  for (const k of ['data', ...keys, 'items', 'results']) {
    if (Array.isArray(res?.[k])) return res[k];
    if (Array.isArray(res?.data?.[k])) return res.data[k];
  }
  return [];
};

async function request(path) {
  const res = await fetch(`${API_V1}${path}`, { headers: { Accept: 'application/json' } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || json?.detail || `Request failed (${res.status})`);
  }
  return json;
}

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() && v !== 'all') q.set(k, String(v).trim());
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

// ---------- Normalizers ----------
export function normalizeMerchant(m, idx = 0) {
  let photos = m.photos || m.merchant_photos || [];
  if (!Array.isArray(photos) || photos.length === 0) {
    photos = [m.photo_1, m.photo_2, m.photo_3, m.photo_4, m.photo_5, m.photo_6].filter(Boolean);
  }
  photos = photos.map(formatMediaUrl).filter(Boolean);
  const categoryName = m.category || m.categories?.[0] || 'General';
  const phone = m.phone_number || m.phone || m.contact_number || m.mobile || '';
  const rating = Number(m.rating || m.avg_rating || 4.5);
  const city = m.city || m.location || m.district || '';
  const lat = m.latitude ?? m.lat;
  const lng = m.longitude ?? m.lng ?? m.lon;

  return {
    id: String(m.id || m.merchant_id || m._id || idx + 1),
    name: m.business_name || m.name || 'Merchant Store',
    category: slugify(categoryName),
    categoryName,
    rating,
    reviewCount: Number(m.reviews_count || m.reviews || 0),
    distance: city,
    city,
    district: m.district || '',
    address: m.address || [city, m.district, m.state].filter(Boolean).join(', '),
    landmark: m.landmark || '',
    phone,
    whatsapp: m.whatsapp || phone,
    email: m.email || '',
    website: m.website || '',
    instagram: m.instagram || '',
    facebook: m.facebook || '',
    hours: m.service_timing || '09:00 AM - 09:00 PM',
    isOpen: true,
    description: m.about || m.description || '',
    tags: [
      ...(Array.isArray(m.categories) ? m.categories : [categoryName]),
      ...(Array.isArray(m.services) ? m.services : []),
    ].filter(Boolean).slice(0, 4),
    highlights: Array.isArray(m.key_highlights) ? m.key_highlights : [],
    image: photos[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    photos,
    videoUrl: m.video_url || m.merchant_videos?.[0] || '',
    isFeatured: rating >= 4.5,
    latitude: lat != null ? Number(lat) : null,
    longitude: lng != null ? Number(lng) : null,
    createdAt: m.created_at || null,
  };
}

export function normalizeCategory(c, idx = 0) {
  const name = c.name || c.category_name || 'Category';
  const slug = c.slug || slugify(name);
  return {
    id: slug,
    apiId: c.id,
    name,
    slug,
    icon: 'pricetag-outline',
    iconUrl: formatMediaUrl(c.icon_url || c.icon || ''),
    description: c.description || `${name} services, stores & professionals`,
    count: c.logo_count || c.count || 0,
    isActive: c.is_active !== false,
    ...PALETTE[idx % PALETTE.length],
  };
}

export function normalizePromotion(p) {
  const rawVideo = p.video_url || '';
  return {
    id: String(p.id),
    title: p.title || '',
    description: p.description || '',
    category: p.category || '',
    placement: p.placement || '',
    image: formatMediaUrl(p.image_url || p.thumbnail_url || ''),
    videoUrl: rawVideo ? formatMediaUrl(rawVideo) : '',
    targetUrl: p.target_url || '#',
    merchantId: p.merchant_id ? String(p.merchant_id) : null,
  };
}

function matchesPlacement(promo, placement) {
  if (!placement) return true;
  const value = String(promo.placement || '').toLowerCase().trim();
  const target = String(placement).toLowerCase().trim();
  return value === target || value.startsWith(target);
}

export function isMovingTextPlacement(placement) {
  const value = String(placement || '').toLowerCase();
  return value.includes('moving') || value.includes('ticker');
}

// ---------- In-memory cache ----------
const cache = { merchants: null, categories: null, merchantById: {} };

// ---------- Public endpoints ----------
export async function fetchMerchants(filters = {}, { force = false } = {}) {
  const noFilters = Object.values(filters).every((v) => !v);
  if (noFilters && cache.merchants && !force) return cache.merchants;

  const json = await request(`/merchants${buildQuery(filters)}`);
  const list = extractList(json, 'merchants')
    .filter((m) => {
      const s = String(m.status || m.approval_status || 'approved').toLowerCase();
      return !['pending', 'rejected', 'inactive', 'suspended'].includes(s);
    })
    .map(normalizeMerchant)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  list.forEach((m) => (cache.merchantById[m.id] = m));
  if (noFilters) cache.merchants = list;
  return list;
}

export async function searchMerchants(query, location) {
  const json = await request(`/merchants/search${buildQuery({ q: query, location })}`);
  return extractList(json, 'merchants').map(normalizeMerchant);
}

export async function fetchMerchantById(id) {
  const cleanId = String(id).replace(/^MCH-/, '');
  if (cache.merchantById[cleanId]) return cache.merchantById[cleanId];
  const json = await request(`/merchants/${cleanId}`);
  const m = normalizeMerchant(json.merchant || json.data?.merchant || json.data || json);
  cache.merchantById[m.id] = m;
  return m;
}

export async function fetchCategories({ force = false } = {}) {
  if (cache.categories && !force) return cache.categories;
  const json = await request('/categories');
  cache.categories = extractList(json, 'categories')
    .map(normalizeCategory)
    .filter((c) => c.isActive);
  return cache.categories;
}

export async function fetchPromotions(params = {}) {
  const { placement, ...queryParams } = params;
  const json = await request(`/promotions${buildQuery({ status: 'active', ...queryParams })}`);
  let list = extractList(json, 'promotions').map(normalizePromotion);
  const movingText = placement && isMovingTextPlacement(placement);

  if (movingText) {
    list = list.filter((p) => isMovingTextPlacement(p.placement));
  } else {
    if (placement) {
      list = list.filter((p) => matchesPlacement(p, placement));
    }
    list = list.filter((p) => p.image || p.videoUrl);
    list.sort((a, b) => Number(b.id) - Number(a.id));
  }
  return list;
}

// Places are derived from merchant cities (the web app does the same)
export function derivePlaces(merchants = []) {
  const map = {};
  merchants.forEach((m) => {
    if (!m.city) return;
    const key = m.city.trim();
    if (!map[key]) {
      map[key] = {
        id: slugify(key),
        name: key,
        subtitle: m.district ? `${m.district} District` : 'Kerala',
        businessCount: 0,
        image: m.photos[0] || m.image,
      };
    }
    map[key].businessCount += 1;
  });
  return Object.values(map).sort((a, b) => b.businessCount - a.businessCount);
}
