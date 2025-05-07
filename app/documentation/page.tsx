"use client";

import ContentSection, { CodeBlock } from "../components/documentation/ContentSection";

export default function DocumentationPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">GitHub Nexus Documentation</h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Welcome to the GitHub Nexus documentation. This guide will help you understand how to use GitHub Nexus
        to manage your GitHub workflow efficiently.
      </p>

      <ContentSection title="Introduction">
        <p>
          GitHub Nexus is a powerful web application that provides a centralized dashboard for managing your GitHub
          workflow. It leverages the GitHub API to provide a seamless experience for repository management, issue tracking,
          pull request reviews, and more.
        </p>
        <p className="mt-4">
          Built with Next.js and Tailwind CSS, GitHub Nexus offers a modern, responsive interface that works across
          devices. Authentication is handled securely through GitHub OAuth, ensuring your data remains protected.
        </p>
      </ContentSection>

      <ContentSection title="Getting Started">
        <h3 className="text-xl font-semibold mb-2">Authentication</h3>
        <p>
          GitHub Nexus uses GitHub OAuth for authentication. When you first visit the application, you'll be prompted
          to sign in with your GitHub account. This grants GitHub Nexus limited access to your GitHub data based on
          the permissions you approve.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-2">Key Features</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Repository management and exploration</li>
          <li>Issue and pull request tracking</li>
          <li>GitHub Actions workflow monitoring</li>
          <li>Organization and team management</li>
          <li>Notification center for staying updated</li>
          <li>Advanced search capabilities</li>
        </ul>
      </ContentSection>

      <ContentSection title="Using the GitHub API">
        <p>
          GitHub Nexus uses the Octokit library to interact with GitHub's REST and GraphQL APIs. Here's a basic
          example of how we fetch repositories:
        </p>
        
        <CodeBlock>
{`// Example of fetching repositories using the GitHub service
async function fetchUserRepositories(username: string) {
  const { data } = await octokit.rest.repos.listForUser({
    username,
    per_page: 10,
    sort: "updated"
  });
  return data;
}`}
        </CodeBlock>
        
        <h3 className="text-xl font-semibold mt-6 mb-2">Rate Limiting</h3>
        <p>
          The GitHub API has rate limits that you should be aware of. For authenticated requests, you can make up to
          5,000 requests per hour. GitHub Nexus handles rate limiting gracefully, but it's good to be aware of these
          limitations.
        </p>
        
        <CodeBlock>
{`// Checking rate limit status
async function checkRateLimit() {
  const { data } = await octokit.rest.rateLimit.get();
  console.log(\`Rate limit: \${data.rate.remaining}/\${data.rate.limit}\`);
  return data.rate;
}`}
        </CodeBlock>
      </ContentSection>

      <ContentSection title="Repository Management">
        <p>
          GitHub Nexus provides comprehensive repository management features. You can view, create, update, and delete
          repositories directly from the application.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-2">Creating a Repository</h3>
        <p>
          To create a new repository, navigate to the Repositories page and click the "New Repository" button.
          Fill in the required information and submit the form.
        </p>
        
        <CodeBlock>
{`// Creating a new repository
async function createRepository(name: string, description: string, isPrivate: boolean) {
  const { data } = await octokit.rest.repos.createForAuthenticatedUser({
    name,
    description,
    private: isPrivate,
    auto_init: true
  });
  return data;
}`}
        </CodeBlock>
      </ContentSection>

      <ContentSection title="Issues and Pull Requests">
        <p>
          GitHub Nexus makes it easy to manage issues and pull requests. You can view, create, comment on, and close
          issues and PRs directly from the application.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-2">Creating an Issue</h3>
        <p>
          To create a new issue, navigate to the repository's Issues tab and click the "New Issue" button.
          Fill in the title, description, and other details as needed.
        </p>
        
        <CodeBlock>
{`// Creating a new issue
async function createIssue(owner: string, repo: string, title: string, body: string) {
  const { data } = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body
  });
  return data;
}`}
        </CodeBlock>
      </ContentSection>

      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Need Help?</h2>
        <p className="mb-4">
          If you have any questions or need assistance, please reach out to our support team or check out
          the GitHub repository for more information.
        </p>
        <div className="flex space-x-4">
          <a href="https://github.com/Rohit00112/github-nexus" className="text-blue-600 dark:text-blue-300 hover:underline">
            GitHub Repository
          </a>
          <a href="/contact" className="text-blue-600 dark:text-blue-300 hover:underline">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
