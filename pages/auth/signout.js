import dynamic from "next/dynamic";
import Head from "next/head";

// Create a static placeholder component for build time
function SignOutPlaceholder() {
  return (
    <>
      <Head>
        <title>Sign Out - GitHub Nexus</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
            Loading sign out page...
          </h1>
        </div>
      </div>
    </>
  );
}

// Dynamically import the actual SignOut component with SSR disabled
const SignOutComponent = dynamic(
  () => import("../../components/auth/SignOut"),
  {
    ssr: false,
    loading: () => <SignOutPlaceholder />,
  }
);

export default function SignOutPage() {
  return <SignOutComponent />;
}

// Disable static generation for this page
export async function getStaticProps() {
  return {
    props: {},
  };
}
