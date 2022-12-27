import "@aws-amplify/ui-react/styles.css";

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return <>Test</>;
}
