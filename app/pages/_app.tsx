import 'styles/globals.scss';
import 'nprogress/nprogress.css';

import Head from 'next/head';
import { Router } from 'next/router';
import NProgress from 'nprogress';

import { ConfirmationModalProvider } from 'components/common/ConfirmationModal';
import NavigationMenu from 'components/Navigation/NavigationMenu';

import type { AppProps } from 'next/app';
import { AlertProvider } from 'components/common/Alert/AlertProvider';

import styles from 'styles/pages/wrapper.module.scss';
import { ModalProvider } from 'components/common/Modal';

import UserProvider from 'contexts/user';
import { User } from '@prisma/client';
import { ErrorType } from 'types/errors';
import ErrorComponent from 'components/Error';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());
interface ProtectedPageProps {
  user: User;
}
function App({ Component, pageProps }: AppProps<ProtectedPageProps>) {
  const { ...componentProps } = pageProps;

  if (pageProps.error) {
    const { statusCode, message } = pageProps.error as ErrorType;
    return (
      <>
        <UserProvider user={pageProps.user}>
          <div className={styles.container}>
            <NavigationMenu />
            <div className={styles.contentWrapper}>
              <ErrorComponent code={statusCode} details={message} />
            </div>
          </div>
        </UserProvider>
      </>
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <AlertProvider>
        <UserProvider user={pageProps.user}>
          <ConfirmationModalProvider>
            <ModalProvider>
              <div className={styles.container}>
                <NavigationMenu />
                <div className={styles.contentWrapper}>
                  <Component {...componentProps} />
                </div>
              </div>
            </ModalProvider>
          </ConfirmationModalProvider>
        </UserProvider>
      </AlertProvider>
    </>
  );
}

export default App;
