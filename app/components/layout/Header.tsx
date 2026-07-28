"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FC } from 'react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';
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
import HeaderSearchBar from '../ui/HeaderSearchBar';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { session, isAuthenticated } = useAuth();

  return (
    <Navbar
      maxWidth="xl"
      className="fixed top-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-b border-border"
      classNames={{
        wrapper: "px-4 h-14",
      }}
    >
      <NavbarBrand className="gap-2">
        {isAuthenticated && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 relative">
            <Image
              src="/logo.svg"
              alt="GitHub Nexus"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-sm font-semibold tracking-tight hidden sm:inline">GitHub Nexus</span>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden md:flex gap-1" justify="center">
        {isAuthenticated && (
          <>
            <NavbarItem>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
                Dashboard
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="/repositories" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
                Repositories
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="/issues" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
                Issues
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="/pull-requests" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
                Pull Requests
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
                Projects
              </Link>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-1">
        {isAuthenticated && (
          <NavbarItem className="hidden md:flex">
            <HeaderSearchBar />
          </NavbarItem>
        )}

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
                  className="transition-transform hover:ring-2 hover:ring-border"
                  src={session?.user?.image || undefined}
                  name={session?.user?.name?.charAt(0) || "U"}
                  size="sm"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu" variant="flat" className="w-56">
                <DropdownItem key="profile" textValue="Profile" className="h-auto gap-2 py-3">
                  <p className="font-medium text-sm">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </DropdownItem>
                <DropdownItem key="profile-page">
                  <Link href="/profile" className="w-full text-sm">Your Profile</Link>
                </DropdownItem>
                <DropdownItem key="settings">
                  <Link href="/settings" className="w-full text-sm">Settings</Link>
                </DropdownItem>
                <DropdownItem key="logout" color="danger">
                  <Link href="/auth/signout" className="w-full text-sm">Sign out</Link>
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
              size="sm"
              className="rounded-lg font-medium"
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
