"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"oauth" | "pat" | "app">("oauth");
  const [patToken, setPatToken] = useState("");
  const [appId, setAppId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [installationId, setInstallationId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSignIn = async () => {
    setIsLoading(true); setError(null);
    await signIn("github", { callbackUrl: "/" });
  };

  const handlePatSignIn = async () => {
    if (!patToken) { setError("Personal Access Token is required"); return; }
    setIsLoading(true); setError(null);
    const result = await signIn("github-pat", { token: patToken, redirect: false });
    if (result?.error) { setError("Invalid Personal Access Token"); setIsLoading(false); } else { window.location.href = "/"; }
  };

  const handleAppSignIn = async () => {
    if (!appId || !privateKey || !installationId) { setError("All GitHub App fields are required"); return; }
    setIsLoading(true); setError(null);
    const result = await signIn("github-app", { appId, privateKey, installationId, redirect: false });
    if (result?.error) { setError("Invalid GitHub App credentials"); setIsLoading(false); } else { window.location.href = "/"; }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image src="/logo.svg" alt="GitHub Nexus" width={64} height={64} className="mx-auto" />
          </Link>
          <h1 className="text-xl font-bold mt-4">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your GitHub Nexus account</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-border">
            {[
              { key: "oauth" as const, label: "OAuth" },
              { key: "pat" as const, label: "Token" },
              { key: "app" as const, label: "GitHub App" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-4 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
        )}

        {activeTab === "oauth" && (
          <button
            onClick={handleOAuthSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-foreground text-background hover:opacity-90 py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-70 text-sm"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
            )}
            <span>{isLoading ? "Signing in..." : "Sign in with GitHub"}</span>
          </button>
        )}

        {activeTab === "pat" && (
          <div>
            <div className="mb-4">
              <label htmlFor="pat" className="block text-sm font-medium mb-1.5">Personal Access Token</label>
              <input id="pat" type="password" value={patToken} onChange={(e) => setPatToken(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
              <p className="mt-1 text-xs text-muted-foreground">Requires <code className="bg-muted px-1 py-0.5 rounded">repo</code>, <code className="bg-muted px-1 py-0.5 rounded">read:user</code>, and <code className="bg-muted px-1 py-0.5 rounded">user:email</code> scopes.</p>
            </div>
            <button onClick={handlePatSignIn} disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-70 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              <span>{isLoading ? "Signing in..." : "Sign in with Token"}</span>
            </button>
          </div>
        )}

        {activeTab === "app" && (
          <div>
            {[
              { id: "appId", label: "App ID", value: appId, setter: setAppId, placeholder: "123456", type: "text" },
              { id: "privateKey", label: "Private Key", value: privateKey, setter: setPrivateKey, placeholder: "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----", type: "textarea" },
              { id: "installationId", label: "Installation ID", value: installationId, setter: setInstallationId, placeholder: "12345678", type: "text" },
            ].map((field) => (
              <div key={field.id} className="mb-4">
                <label htmlFor={field.id} className="block text-sm font-medium mb-1.5">{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea id={field.id} value={field.value} onChange={(e) => field.setter(e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono"
                    placeholder={field.placeholder} />
                ) : (
                  <input id={field.id} type="text" value={field.value} onChange={(e) => field.setter(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    placeholder={field.placeholder} />
                )}
              </div>
            ))}
            <button onClick={handleAppSignIn} disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-70 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>{isLoading ? "Signing in..." : "Sign in with GitHub App"}</span>
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-foreground hover:underline">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-foreground hover:underline">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
