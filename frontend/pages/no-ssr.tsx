import { API, Auth, withSSRContext } from "aws-amplify";
import * as React from "react";

export default function Home(props) {
  const [message, setMessage] = React.useState(props.message);

  React.useEffect(() => {
    (async () => {
      // const myInit = { // works
      //   headers: {
      //     Authorization: `Bearer ${(await Auth.currentSession())
      //       .getIdToken()
      //       .getJwtToken()}`,
      //   },
      // };

      const myInit = {}; // does not work

      // shouldn't init be optional? I thought API.get would handle auth automatically
      const payload = await API.get("API", "hello", myInit);

      setMessage(payload.message);
    })();
  }, []);

  return <div>{message}</div>;
}
