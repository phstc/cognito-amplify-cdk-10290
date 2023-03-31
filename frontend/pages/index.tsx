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
        <a href="/no-ssr">No SSR</a>
      </li>
      <li>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            Auth.signOut();
          }}
        >
          Sign out
        </a>
      </li>
    </div>
  );
}
