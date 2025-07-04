import { useState } from 'react';

export default function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = async (...args) => {  
    setLoading(true);
    try {
      const result = await apiFunc(...args);
      setData(result.data);
      return result;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, request };
}