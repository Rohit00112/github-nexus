# GitHub Nexus

A modern, web-based platform designed to give developers, teams, and organizations a centralized dashboard to manage, automate, and optimize their entire GitHub workflow—without ever leaving the application.

## Project Overview

GitHub Nexus is built entirely on top of the GitHub REST and GraphQL APIs, offering a comprehensive suite of features that cover every phase of the software development lifecycle—from repository creation to release management—via an intuitive and interactive UI.

## Core Objectives

- Provide a no-code/low-code interface to perform all GitHub operations
- Enhance visibility and control over repositories, issues, pull requests, actions, and workflows
- Enable custom automation and multi-repository orchestration
- Serve as a collaboration layer across development teams

## Key Features

### 🗃️ Repository Management
- Create, update, archive, or delete repositories
- Manage repository settings (visibility, topics, default branch, etc.)
- Configure branch protections and rules via UI
- Clone repo templates or import existing ones

### 👥 User & Access Control
- Manage collaborators, teams, and permissions
- Invite users to organizations or specific repos
- Display and edit team structures and roles

### 🐞 Issue & Project Tracking
- Create, label, assign, and comment on issues
- View and edit GitHub Projects (classic & beta)
- Add custom filters, Kanban views, and milestones
- Issue templates and bulk actions support

### 🔀 Pull Request Management
- Create and review PRs, assign reviewers, add comments
- Display diff views and commit histories
- Merge, close, or rebase PRs from the interface
- Track approval status and CI/CD checks

### ⚙️ GitHub Actions & Workflows
- View, manage, and trigger GitHub Actions workflows
- Monitor job runs, logs, and status
- Configure new workflows using a visual builder
- Integrate secrets and environment settings

### 📊 Insights & Metrics
- Display contributor stats, commits, and PR velocity
- Issue aging, code frequency, and team productivity charts
- Customizable dashboards and export options

### 📤 Notifications & Integrations
- Connect to Slack, Discord, or email for alerts
- Webhook configuration and event subscriptions
- Custom rules for notifications

### 🧩 Extensibility & Plugins
- Support for user-defined automation scripts (via a plugin SDK)
- GitHub App authentication for secure multi-org access
- Theme support and user dashboard customization

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Node.js/Express or FastAPI (optional, for custom logic or caching)
- **Auth**: GitHub OAuth or GitHub App
- **API**: GitHub REST + GraphQL
- **Database**: PostgreSQL or MongoDB (optional – for caching or persistent settings)
- **DevOps**: Docker, GitHub Actions (CI for Nexus itself)

## Implemented Features

### 🐞 Issue & Project Tracking
- View and filter issues across repositories
- Detailed issue view with comments and status updates
- Create, edit, and close issues
- Add and remove labels, assignees, and milestones
- Comment on issues with markdown support

### 🔀 Pull Request Management
- Browse and filter pull requests
- Detailed PR view with commit history and file changes
- Review and merge pull requests
- Add comments and review requests
- Track CI/CD status and merge conflicts

### ⚙️ GitHub Actions & Workflows
- View and manage GitHub Actions workflows
- Detailed workflow run information with job and step status
- Trigger workflow runs manually
- Cancel running workflows
- View workflow logs and artifacts

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- GitHub account with personal access token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rohit00112/github-nexus.git
cd github-nexus
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Authentication

GitHub Nexus uses GitHub OAuth for authentication. When you first access the application, you'll be prompted to sign in with your GitHub account and authorize the application to access your repositories, issues, pull requests, and workflows.

## Deployment

### Deploying to Vercel

The easiest way to deploy GitHub Nexus is to use the [Vercel Platform](https://vercel.com):

1. Push your code to a GitHub repository
2. Import the project to Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy

### Docker Deployment

You can also deploy GitHub Nexus using Docker:

1. Build the Docker image:
```bash
docker build -t github-nexus .
```

2. Run the container:
```bash
docker run -p 3000:3000 -e GITHUB_CLIENT_ID=your_client_id -e GITHUB_CLIENT_SECRET=your_client_secret -e NEXTAUTH_SECRET=your_secret -e NEXTAUTH_URL=your_url github-nexus
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)
