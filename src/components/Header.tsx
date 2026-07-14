/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Page, User } from "../types";
import { BookOpen, Bookmark, User as UserIcon, LogOut, Menu, X, PlusCircle, LayoutDashboard, Sun, Moon, FolderGit2 } from "lucide-react";

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Header({
  activePage,
  setActivePage,
  user,
  onLogout,
  onLoginClick,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { page: "home" as Page, label: "Home", icon: LayoutDashboard },
    { page: "submit-review" as Page, label: "Submit a review", icon: PlusCircle },
    { page: "bookmarks" as Page, label: "Bookmarks", icon: Bookmark },
    { page: "profile" as Page, label: "Profile", icon: UserIcon },
  ];

  const handleNavClick = (page: Page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-app-border bg-app-surface/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Brand */}
        <button
          onClick={() => handleNavClick("home")}
          className="group flex items-center gap-2 text-left focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text-primary transition-transform group-hover:scale-105">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="block font-sans text-lg font-bold tracking-tight text-app-text-primary transition-colors group-hover:text-app-text-secondary">
              BITS Course Reviews
            </span>
            {user && (
              <span className="block text-[10px] font-medium tracking-wider text-app-text-secondary uppercase">
                {user.campus} Campus
              </span>
            )}
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.page || (item.page === "home" && activePage === "browse");
            return (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-app-accent text-white shadow-sm"
                    : "text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}

          <div className="h-6 w-[1px] bg-app-border mx-2" />

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface transition-all duration-200 mr-2"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-1">
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-4 py-2 bg-app-accent text-white rounded-xl text-sm font-semibold hover:bg-app-accent-hover shadow-md transition-all duration-200"
            >
              Sign in
            </button>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface transition-all duration-200"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {user && (
            <span className="text-xs font-medium text-app-text-secondary bg-app-surface border border-app-border px-2 py-1 rounded-lg">
              {user.campus}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-1.5 text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-app-border bg-app-surface px-4 py-4 space-y-3 shadow-xl transition-colors duration-200">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.page || (item.page === "home" && activePage === "browse");
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-app-accent text-white"
                      : "text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="h-[1px] bg-app-border" />

          {user ? (
            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onLoginClick();
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-app-accent text-white rounded-xl text-sm font-semibold hover:bg-app-accent-hover"
            >
              Sign in
            </button>
          )}
        </div>
      )}
    </header>
  );
}
