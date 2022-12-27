Sample repo for troubleshooting [Next.js and AWS Amplify "No current user" at getServerSideProps - REST, not GraphQ](https://github.com/aws-amplify/amplify-js/issues/10290)

### Set up

```sh
cd backend
npm install
```

- Make sure you have a valid [GITHUB_TOKEN](https://github.com/phstc/cognito-amplify-cdk-10290/blob/ccea786393e9addc6c71ff846b144a4fd77db245/backend/src/infra/app-stack.ts#L93) secret.
- Set a unique domain for your Cognito user pool [here](https://github.com/phstc/cognito-amplify-cdk-10290/blob/ccea786393e9addc6c71ff846b144a4fd77db245/backend/src/infra/auth-stack.ts#L57).
- Update the frontend Amplify configuration [here](https://github.com/phstc/cognito-amplify-cdk-10290/blob/ff2330b94138ca31f8e2b223c270d91e58c4dcae/frontend/src/configure-amplify.ts#L29) to use the same unique domain

```sh
npm run deploy
```

Once the deployment is completed, get the output from the deployment (or check them on the Amplify deployed app/Environment variables) and configure [env.local.sample](https://github.com/phstc/cognito-amplify-cdk-10290/blob/5a82b49ed775319d7575211b58d5a022f38fb2c5/frontend/env.local.sample) with the deploy output values then rename the file to `env.local`.

```sh
mv frontend/env.local.sample frontend/env.local
```

Install frontend dependencies:

```sh
cd frontend
npm install
```

### Running

```sh
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) there will be two links:

- [Works SSR](http://localhost:3000/works-ssr)
- [Does not work SSR](http://localhost:3000/does-not-work-ssr)
