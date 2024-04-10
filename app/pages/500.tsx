import Head from 'next/head';
import ErrorComponent from 'components/Error';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>Tanuki - Erreur 500</title>
      </Head>
      <main>
        <ErrorComponent
          code={500}
          details="La ressource demandée ne peut pas être affichée à cause d'une erreur du serveur."
        />
      </main>
    </>
  );
}
