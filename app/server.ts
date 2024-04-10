import express from 'express';
import next from 'next';
import { userDataMiddleware } from './middlewares/user-middlewares';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function warmupNextjsCache() {
  const path = require('path');
  const serverPath = path.join(__dirname, 'server');

  try {
    const pagesManifest = require(path.join(serverPath, 'pages-manifest.json'));
    Object.values(pagesManifest).forEach(dep => {
      if (path.extname(dep) !== '.js') {
        return;
      }
      require(path.join(serverPath, dep));
    });
  } catch (e: unknown) {
    console.error('Error while preloading modules : ', (e as Error).message);
  }
}

app.prepare().then(async () => {
  const server = express();

  checkEnvironmentVariables('DATABASE_URL');

  // GCP warmup request
  // see https://cloud.google.com/appengine/docs/standard/configuring-warmup-requests?tab=node.js#top
  server.get('/_ah/warmup', async (_, res) => {
    return res.setHeader('Content-Type', 'application/json').status(200).end();
  });

  server.all('*', userDataMiddleware, (req, res) => handle(req, res));

  server.listen(process.env.PORT);
});

if (!dev) {
  warmupNextjsCache();
}

function checkEnvironmentVariables(...mandatoryVars: string[]) {
  const missingMandatoryVariables = mandatoryVars.filter(envVar => !process.env[envVar]);

  if (missingMandatoryVariables.length > 0) {
    throw new Error(
      `Server couldn't start because of missing environment variable(s): ${missingMandatoryVariables.join(
        ','
      )}`
    );
  }
}
