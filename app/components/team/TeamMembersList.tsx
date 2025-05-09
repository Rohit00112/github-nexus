"use client";

import { useEffect, useState } from "react";
import { useGitHub } from "../../context/GitHubContext";
import MemberCard from "./MemberCard";

interface TeamMembersListProps {
  org: string;
  team_slug?: string;
}

interface Member {
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
  bio?: string;
  type: string;
}

interface MemberWithContributions {
  member: Member;
  contributions: {
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
    repositories: number;
  };
  role?: string;
}

export default function TeamMembersList({ org, team_slug }: TeamMembersListProps) {
  const { githubService } = useGitHub();
  const [members, setMembers] = useState<MemberWithContributions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        let membersList: Member[] = [];
        
        if (team_slug) {
          // Fetch team members
          membersList = await githubService.getTeamMembers(org, team_slug);
        } else {
          // Fetch organization members
          membersList = await githubService.getOrganizationMembers(org);
        }
        
        // Fetch contributions for each member
        const membersWithContributions = await Promise.all(
          membersList.map(async (member) => {
            const contributions = await githubService.getUserContributions(member.login);
            return {
              member,
              contributions,
              role: team_slug ? "Team Member" : "Organization Member",
            };
          })
        );
        
        setMembers(membersWithContributions);
      } catch (err) {
        console.error("Error fetching team members:", err);
        setError("Failed to load team members. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMembers();
  }, [githubService, org, team_slug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        No team members found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((memberData) => (
        <MemberCard
          key={memberData.member.login}
          member={memberData.member}
          contributions={memberData.contributions}
          role={memberData.role}
        />
      ))}
    </div>
  );
}
