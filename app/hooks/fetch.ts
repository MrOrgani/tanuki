import debounce from 'lodash.debounce';
import { DependencyList, useEffect, useRef, useState } from 'react';

const useFetch = <ResultType = unknown>(
  url: string,
  deps: DependencyList = [],
  debounceDelay = 0,
  method: 'GET' | 'POST' = 'GET',
  postData: unknown = {}
) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAlive = useRef(true);
  const abortController = useRef<AbortController>(new AbortController());

  const init = debounce(async () => {
    setLoading(true);
    abortController.current = new AbortController();

    const res = await fetch(url, {
      signal: abortController.current.signal,
      ...(method === 'POST'
        ? {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
          }
        : {}),
    });

    if (!isAlive.current) return;
    if (!res.ok) {
      setError(res.statusText);
      return setLoading(true);
    }

    const data = await res.json();

    if (isAlive.current) {
      setResult(data);
      setLoading(false);
    }
  }, debounceDelay);

  useEffect(() => {
    init();
    return () => {
      init.cancel();
    };
  }, [...deps]);

  useEffect(() => {
    return () => {
      isAlive.current = false;
      abortController.current.abort();
    };
  }, []);

  return { result, loading, error };
};

export default useFetch;
