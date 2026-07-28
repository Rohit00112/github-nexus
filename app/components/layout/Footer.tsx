"use client";

import Link from 'next/link';
import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">GitHub Nexus</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A centralized dashboard to manage, automate, and optimize your entire GitHub workflow.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/repositories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Repositories
                </Link>
              </li>
              <li>
                <Link href="/issues" className="text-muted-foreground hover:text-foreground transition-colors">
                  Issues
                </Link>
              </li>
              <li>
                <Link href="/pull-requests" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pull Requests
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
                  Projects
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/documentation" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a href="https://github.com/Rohit00112/github-nexus" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="mailto:info@example.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} GitHub Nexus. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
