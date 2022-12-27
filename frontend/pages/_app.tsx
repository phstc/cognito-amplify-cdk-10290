import "@aws-amplify/ui-react/styles.css";
import { Auth } from "aws-amplify";
import { useEffect } from "react";
import "../src/configure-amplify";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    (async () => {
      try {
        await Auth.currentAuthenticatedUser();
      } catch (e) {
        Auth.federatedSignIn();
      }
    })();
  }, []);

  return <div>{<Component {...pageProps} />}</div>;
}

export default MyApp;
