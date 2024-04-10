export default async function getSecret(secretName: string): Promise<string> {
  let secret;
  const appEnv: string | undefined = process.env.APP_ENV;

  if (appEnv === 'local') {
    secret = process.env[secretName];
  } else {
    secret = getFromSecretManager(secretName);
  }

  if (!secret) {
    throw new Error(`Error while retrieving secret '${secretName}' from Secret Manager`);
  }

  return secret;
}

async function getFromSecretManager(secretName: string): Promise<string> {
  const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

  const secretManagerClient = new SecretManagerServiceClient(
    process.env.NODE_ENV === 'development'
      ? {
          keyFilename: './secrets/service-account-key.json',
        }
      : undefined
  );
  const gcpProjectId = await secretManagerClient.getProjectId();
  const [secretVersion] = await secretManagerClient.accessSecretVersion({
    name: `projects/${gcpProjectId}/secrets/${secretName}/versions/latest`,
  });

  const secret = secretVersion.payload?.data.toString();

  return secret;
}
