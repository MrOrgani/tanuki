import Head from 'next/head';
import ErrorComponent from 'components/Error';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Tanuki - Erreur 404</title>
      </Head>
      <main>
        <ErrorComponent code={404} details="La page que vous cherchez n'existe pas." />
      </main>
    </>
  );
}
