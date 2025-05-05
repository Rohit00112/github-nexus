"use client";

import Link from 'next/link';
import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">GitHub Nexus</h3>
            <p className="text-sm">
              A modern, web-based platform designed to give developers, teams, and organizations a centralized dashboard to manage, automate, and optimize their entire GitHub workflow.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/repositories" className="hover:text-white transition-colors">
                  Repository Management
                </Link>
              </li>
              <li>
                <Link href="/issues" className="hover:text-white transition-colors">
                  Issue Tracking
                </Link>
              </li>
              <li>
                <Link href="/pull-requests" className="hover:text-white transition-colors">
                  Pull Request Management
                </Link>
              </li>
              <li>
                <Link href="/actions" className="hover:text-white transition-colors">
                  GitHub Actions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/documentation" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <a href="https://github.com/Rohit00112/github-nexus" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="mailto:info@example.com" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} GitHub Nexus. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
