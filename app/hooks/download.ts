import { RequestMethod } from 'types/request';

interface DownloadLinkProps {
  endpoint: string;
  data: Record<string, unknown>;
  method?: RequestMethod;
  filename?: string;
}

interface DownloadLinkData {
  url: string;
  filename: string;
}

export const useDownload = () => {
  const getDownloadLink = async ({
    endpoint,
    data,
    method = RequestMethod.POST,
    filename,
  }: DownloadLinkProps): Promise<DownloadLinkData> => {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error('Erreur lors de la récupération des données à exporter');
    }

    const headerFilename = response.headers.get('Content-Disposition')?.match(/filename="(.*)"/);

    return {
      url: window.URL.createObjectURL(blob),
      filename: filename || (headerFilename ? headerFilename[1] : 'export.csv'),
    };
  };

  return { getDownloadLink };
};

export default useDownload;
