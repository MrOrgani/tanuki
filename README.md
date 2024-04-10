## Getting Started

### Retrieve Project

1. Clone the repository on your machine

```bash
git clone https://github.com/hubvisory-source/tanuki.git
```

2. Go to app/ directory

3. Make sure you use the correct Node version, we recommend using [nvm](https://github.com/nvm-sh/nvm) and running "nvm use" inside this folder, it will use the `.nvmrc` file to resolve the node version.

4. Install Dependencies

```bash
npm install
```
5. Generate the prisma client (see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client)
```
npx prisma generate
```
**Make sure to always do this when switching branches !**

### Work locally on a new feature

1. Create a new branch, see the [branch naming convention](#branch-naming-convention) for more information


2. Create a `.env` file using an existing template
```bash
cp .env.template .env
```

3. Populate the database  (see [working against a local mongodb](#working-against-a-local-mongodb))

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

5. Start Coding ! Your app should automatically update as you save files.

## Branch Naming Convention

We name our branches by loosely following the same convention as "conventional commits":

```markdown
<type>([issue id])/name-of-branch

# Examples

feat(#25)/new-welcome-screen
fix/broken-email-in-contact-form
```

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#summary). Each commit message must be formatted with the following convention:

```
<type>([optional scope]): <commit description>

[optional body]

[optional footer]
```

Following this convention allows us to speak the same language, but also to start automating the redaction of changelogs down the road.

**Make sure to read and understand the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#summary)** and contact the repository maintainers when in doubt.

## Deployment

The App is deployed to Google Cloud Platform.
It uses:

- [Cloud Build](https://cloud.google.com/cloud-build/) as a deployment tool
- [App Engine](https://cloud.google.com/appengine) as app hosting
- [MongoDB Atlas](https://www.mongodb.com) as database
- [Cloud Functions](https://cloud.google.com/functions/docs) for utility functions to update database and retrieve user links
- [Secret Manager](https://cloud.google.com/secret-manager) to store secrets used to hash/salt user access links

We currently work on a single Google Cloud Platform instance which holds our production code.

**You're not to deploy your local code to the production project under any circumstance**

When code is merged to the **main** branch, Cloud Build will automatically trigger a build + deployment pipeline for production, as specified in `./cloudbuild.yaml`

## Additional Utilities

### Working against a local mongodb

A `docker-compose.yml` file is available to run a single replicaset mongo instance. Data is then stored inside the `./local_mongo/data` folder

1. `docker-compose up -d`
2. Add `DATABASE_URL="mongodb://localhost:27017/tanuki-dev?authSource=admin&retryWrites=false"` to your .env file (if not already set)
3. `npx prisma db push` to sync the prisma schema to your local database
4. `npx prisma db seed` to populate your local database
5. You can use `MongoDB Compass` to help you navigate your database and manipulate data.

## FAQ

## Front-End Testing

### I get a "Network Request Failed error"

It's likely that your code is making a fetch request which hasn't been mocked. We use [MSW](https://mswjs.io/) to mock API calls, inside existing tests or inside `handlers.js`, look for imports `import { rest } from 'msw'` to figure out how to mock your api call.

### "Warning: An update to XXX inside a test was not wrapped in act(...)."

There are many reasons why this error can be shown, and it is important to understand why.
Take a look at the following blog post: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning

## More Information

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

About others dependencies used :

- [Material-UI](https://material-ui.com/api/)
  - [Material-UI CSS priority](https://material-ui.com/guides/interoperability/#css-modules)
  - [Material-UI CSS Overriding](https://material-ui.com/customization/components/#overriding-styles-with-classes)
