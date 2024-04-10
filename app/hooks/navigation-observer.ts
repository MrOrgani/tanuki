import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

const useNavigationObserver = ({ shouldPauseNavigation, onNavigationAttempt }: Options) => {
  const router = useRouter();
  const isPaused = useRef(shouldPauseNavigation);

  // This is a workaround for the browser back button
  // When the user clicks the back button, the browser will try to navigate to the previous page
  // We need to cancel this navigation by pushing the current url back to the history
  const onPopStateChange = () =>
    isPaused.current && window.history.pushState(null, '', router.asPath);

  const onRouteChange = (url: string) => {
    if (!isPaused.current || url === router.asPath) return;

    onNavigationAttempt && onNavigationAttempt(url);
    router.events.emit('routeChangeError');
    throw 'Abort route change due to unsaved changes in form. Please ignore this error.';
  };

  useEffect(() => {
    window.addEventListener('popstate', onPopStateChange);
    router.events.on('routeChangeStart', onRouteChange);
    return () => {
      window.removeEventListener('popstate', onPopStateChange);
      router.events.off('routeChangeStart', onRouteChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isNavigationPaused = () => isPaused.current;
  const pauseNavigation = () => (isPaused.current = true);
  const resumeNavigation = () => (isPaused.current = false);
  const clearObserver = () => {
    router.events.off('routeChangeStart', onRouteChange);
    window.removeEventListener('popstate', onPopStateChange);
  };

  return {
    pauseNavigation,
    resumeNavigation,
    isNavigationPaused,
    clearObserver,
  };
};

interface Options {
  shouldPauseNavigation: boolean;
  onNavigationAttempt?: (nextUrl: string) => void;
}

export default useNavigationObserver;
