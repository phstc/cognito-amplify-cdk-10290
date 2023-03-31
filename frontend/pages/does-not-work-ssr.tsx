import { withSSRContext } from "aws-amplify";
import * as React from "react";

export default function Home(props) {
  const [message, _setMessage] = React.useState(props.message);

  return <div>{message}</div>;
}

export const getServerSideProps = async ({ req }) => {
  const SSR = withSSRContext({ req });

  const myInit = {
    headers: {
      Authorization: `Bearer ${(await SSR.Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`,
    },
  };
  // This does not work, it returns no current user
  const payload = await SSR.API.get("API", "hello", myInit);

  return {
    props: { message: payload.message },
  };
};
