import { Amplify, Auth } from "aws-amplify";

const getOauthRedirects = () => {
  if (!process.env.NEXT_PUBLIC_AUTH_URL) {
    return {
      redirectSignIn: 'http://localhost:3000/auth-callback',
      redirectSignOut: 'http://localhost:3000/',
    }
  }


  // production
  return {
    redirectSignIn: `${process.env.NEXT_PUBLIC_AUTH_URL}/auth-callback`,
    redirectSignOut: process.env.NEXT_PUBLIC_AUTH_URL
  }
}

const amplifyConfig = {
  ssr: true,

  Auth: {
    identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
    region: process.env.NEXT_PUBLIC_REGION,
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID,
    // mandatorySignIn: true,
    oauth: {
      domain: 'gh10290.auth.us-east-1.amazoncognito.com',
      scope: ['email', 'openid', 'profile'],
      ...getOauthRedirects(),
      responseType: 'code',
    },
    federationTarget: "COGNITO_USER_POOLS",
  },

  API: {
    endpoints: [
      {
        name: "API",
        endpoint: process.env.NEXT_PUBLIC_ENDPOINT,
        // custom_header: async () => {
        //   // return { Authorization: "token" };
        //   // Alternatively, with Cognito User Pools use this:
        //   // return { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}` }
        //   const header = {
        //     Authorization: `Bearer ${(await Auth.currentSession())
        //       .getIdToken()
        //       .getJwtToken()}`,
        //   };

        //   return header
        // },
      },
    ],
  },
};

Amplify.configure(amplifyConfig);
