import "@aws-amplify/ui-react/styles.css";
import "../src/configure-amplify";
import "../styles/globals.css";
import "./styles/table-select.scss";

import "@cloudscape-design/global-styles";

function MyApp({ Component, pageProps }) {
  return <div>{<Component {...pageProps} />}</div>;
}

export default MyApp;
