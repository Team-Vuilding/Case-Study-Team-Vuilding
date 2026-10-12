import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from './api';

export default function useApiData(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      setError('');
      try {
        const result = await apiRequest(endpoint);
        if (active) setData(result.data);
      } catch (reason) {
        if (active) setError(reason.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [endpoint, revision]);
  useEffect(() => {
    window.addEventListener('wba-data-changed', reload);
    return () => window.removeEventListener('wba-data-changed', reload);
  }, [reload]);
  return { data, loading: loading && data === null, error, reload };
}
