import { withSSRContext } from "aws-amplify";
import * as React from "react";

export default function Home(props) {
  const [message, _setMessage] = React.useState(props.message);

  return <div>{message}</div>;
}

export const getServerSideProps = async ({ req }) => {
  const SSR = withSSRContext({ req });

  // This does not work, it returns no current user
  const payload = await SSR.API.get("API", "hello", {});

  return {
    props: { message: payload.message },
  };
};
