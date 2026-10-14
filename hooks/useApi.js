// Generic data-fetching hook with loading / error / refresh
import { useCallback, useEffect, useRef, useState } from 'react';

export default function useApi(fetcher, deps = [], initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const result = await fetcher(isRefresh);
      if (mounted.current) setData(result);
    } catch (e) {
      if (mounted.current) setError(e.message || 'Something went wrong');
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { data, loading, refreshing, error, reload: load, refresh: () => load(true) };
}
