import { useEffect, useRef, useState, useCallback } from 'react';
import api from '../services/api';

export const useInfiniteScroll = (endpoint, queryParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();

  const stringifiedParams = JSON.stringify(queryParams);

  const loadMoreData = useCallback(async (currentPage, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...JSON.parse(stringifiedParams), page: currentPage, limit: 20 };
      const res = await api.get(endpoint, { params });
      
      let newData = res.data.data || res.data;
      if (res.data.message && Array.isArray(res.data.message) && res.data.message[0]?.data) {
          newData = res.data.message[0].data;
      }
      if (Array.isArray(newData) && newData.length === 1 && newData[0] && Array.isArray(newData[0].data)) {
        newData = newData[0].data;
      }

      const pagination = res.data.pagination;

      setData(prev => reset ? newData : [...prev, ...newData]);
      
      if (pagination) {
        setHasMore(pagination.hasMore);
      } else {
        setHasMore(newData.length === 20);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'An error occurred');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [endpoint, stringifiedParams]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadMoreData(1, true);
  }, [stringifiedParams, loadMoreData]);

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          loadMoreData(nextPage, false);
          return nextPage;
        });
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMoreData]);

  return { data, loading, error, hasMore, lastElementRef };
};
