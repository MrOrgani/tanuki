import { useEffect, useRef } from 'react';
import { RequestMethod } from 'types/request';

const useLazyFetch = () => {
  const abortControllers = useRef<AbortController[]>([]);

  const get = async (url: string): Promise<Response> => {
    const controller = new AbortController();
    abortControllers.current.push(controller);
    return fetch(url, { signal: controller.signal });
  };

  const post = async (url: string, data = {}): Promise<Response> => {
    return fetchWithData(RequestMethod.POST, url, data);
  };

  const put = async (url: string, data = {}): Promise<Response> => {
    return fetchWithData(RequestMethod.PUT, url, data);
  };

  const patch = async (url: string, data = {}): Promise<Response> => {
    return fetchWithData(RequestMethod.PATCH, url, data);
  };

  const httpDelete = async (url: string): Promise<Response> => {
    return fetchWithData(RequestMethod.DELETE, url);
  };

  const fetchWithData = async (
    method: RequestMethod,
    url: string,
    data?: Record<string, unknown>
  ): Promise<Response> => {
    const controller = new AbortController();
    abortControllers.current.push(controller);
    return fetch(url, {
      method,
      signal: controller.signal,
      ...(data
        ? {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        : {}),
    });
  };

  useEffect(() => {
    return () => {
      abortControllers.current.forEach(controller => controller.abort());
    };
  }, []);

  return { get, post, put, patch, httpDelete };
};

export default useLazyFetch;
