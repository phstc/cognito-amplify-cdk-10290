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

  // this works fine
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT}hello`,
    myInit
  );
  const payload = await response.json();

  return {
    props: { message: payload.message },
  };
};
