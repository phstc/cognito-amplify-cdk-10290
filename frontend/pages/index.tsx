import { Auth } from "aws-amplify";

export default function Home() {
  return (
    <div>
      <li>
        <a href="/works-ssr">Works SSR</a>
      </li>
      <li>
        <a href="/does-not-work-ssr">Does not work SSR</a>
      </li>
      <li>
        <a href="/" onClick={() => Auth.signOut()}>
          Sign out
        </a>
      </li>
    </div>
  );
}
