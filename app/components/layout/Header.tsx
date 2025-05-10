"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FC, useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';
import HeaderSearchBar from '../ui/HeaderSearchBar';
import AuthMethodBadge from '../ui/AuthMethodBadge';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Button
} from "@nextui-org/react";
import ThemeToggle from '../ui/ThemeToggle';

const Header: FC = () => {
  const { session, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Navbar
      maxWidth="xl"
      className="bg-background/70 dark:bg-background/70 backdrop-blur-md border-b border-divider"
      classNames={{
        wrapper: "px-4 sm:px-6",
      }}
    >
      <NavbarBrand>
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 relative">
            <Image
              src="/logo.svg"
              alt="GitHub Nexus Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold">GitHub Nexus</span>
        </Link>
      </NavbarBrand>

      {isAuthenticated && (
        <NavbarContent className="hidden md:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="/repositories" className="text-foreground/80 hover:text-foreground transition-colors">
              Repositories
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/issues" className="text-foreground/80 hover:text-foreground transition-colors">
              Issues
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/pull-requests" className="text-foreground/80 hover:text-foreground transition-colors">
              Pull Requests
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/gists" className="text-foreground/80 hover:text-foreground transition-colors">
              Gists
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/code-review" className="text-foreground/80 hover:text-foreground transition-colors">
              Code Review
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/projects" className="text-foreground/80 hover:text-foreground transition-colors">
              Projects
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/actions" className="text-foreground/80 hover:text-foreground transition-colors">
              Actions
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/insights" className="text-foreground/80 hover:text-foreground transition-colors">
              Insights
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/team" className="text-foreground/80 hover:text-foreground transition-colors">
              Team
            </Link>
          </NavbarItem>
        </NavbarContent>
      )}

      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>

        {isAuthenticated ? (
          <>
            <NavbarItem>
              <AuthMethodBadge />
            </NavbarItem>
            <NavbarItem>
              <NotificationBell />
            </NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform"
                  src={session?.user?.image || undefined}
                  name={session?.user?.name?.charAt(0) || "U"}
                  size="sm"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu" variant="flat">
                <DropdownItem key="profile" textValue="Profile" className="h-14 gap-2">
                  <p className="font-semibold">{session?.user?.name}</p>
                  <p className="text-xs text-default-500">{session?.user?.email}</p>
                </DropdownItem>
                <DropdownItem key="profile-page">
                  <Link href="/profile" className="w-full">Your Profile</Link>
                </DropdownItem>
                <DropdownItem key="settings">
                  <Link href="/settings" className="w-full">Settings</Link>
                </DropdownItem>
                <DropdownItem key="logout" color="danger">
                  <Link href="/auth/signout" className="w-full">Sign out</Link>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </>
        ) : (
          <NavbarItem>
            <Button
              as={Link}
              href="/auth/signin"
              color="primary"
              variant="flat"
            >
              Sign in
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default Header;
