import { NextRequest, NextResponse } from 'next/server';
import { AutomationService } from '@/app/services/automation/automationService';
import { GitHubService } from '@/app/services/github/githubService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import crypto from 'crypto';

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  try {
    // Get the raw request body
    const payload = await req.text();
    const jsonPayload = JSON.parse(payload);
    
    // Get the signature from the headers
    const signature = req.headers.get('x-hub-signature-256');
    
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    
    // Verify the signature if a webhook secret is configured
    if (webhookSecret && !verifySignature(payload, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Get the event type
    const event = req.headers.get('x-github-event');
    
    // Process the event
    await processGitHubEvent(event, jsonPayload);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processGitHubEvent(event: string | null, payload: any) {
  if (!event) return;
  
  // Get a session to use for authentication
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    console.error('No access token available for webhook processing');
    return;
  }
  
  // Create GitHub service
  const githubService = new GitHubService(session.accessToken as string);
  
  // Create automation service
  const automationService = new AutomationService(githubService);
  
  // Process different event types
  switch (event) {
    case 'issues':
      await processIssueEvent(automationService, payload);
      break;
    case 'pull_request':
      await processPullRequestEvent(automationService, payload);
      break;
    case 'issue_comment':
      await processIssueCommentEvent(automationService, payload);
      break;
    case 'pull_request_review':
      await processPullRequestReviewEvent(automationService, payload);
      break;
    default:
      console.log(`Unhandled event type: ${event}`);
  }
}

async function processIssueEvent(automationService: AutomationService, payload: any) {
  const { action, issue, repository } = payload;
  console.log(`Processing issue event: ${action} for issue #${issue.number} in ${repository.full_name}`);
  
  // Execute automation rules for this issue
  const [owner, repo] = repository.full_name.split('/');
  await automationService.executeRulesForIssue(owner, repo, issue.number);
}

async function processPullRequestEvent(automationService: AutomationService, payload: any) {
  const { action, pull_request, repository } = payload;
  console.log(`Processing pull request event: ${action} for PR #${pull_request.number} in ${repository.full_name}`);
  
  // Execute automation rules for this pull request
  const [owner, repo] = repository.full_name.split('/');
  await automationService.executeRulesForPullRequest(owner, repo, pull_request.number);
}

async function processIssueCommentEvent(automationService: AutomationService, payload: any) {
  const { action, comment, issue, repository } = payload;
  console.log(`Processing issue comment event: ${action} for issue #${issue.number} in ${repository.full_name}`);
  
  // Execute automation rules for this issue
  const [owner, repo] = repository.full_name.split('/');
  await automationService.executeRulesForIssue(owner, repo, issue.number);
}

async function processPullRequestReviewEvent(automationService: AutomationService, payload: any) {
  const { action, review, pull_request, repository } = payload;
  console.log(`Processing pull request review event: ${action} for PR #${pull_request.number} in ${repository.full_name}`);
  
  // Execute automation rules for this pull request
  const [owner, repo] = repository.full_name.split('/');
  await automationService.executeRulesForPullRequest(owner, repo, pull_request.number);
}
