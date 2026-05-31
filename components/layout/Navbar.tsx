"use client";

import type { NavLink } from "@/types";
import Link from "next/link";
import { useState, useEffect } from "react";

const navLinks: NavLink[] = [
  { label: "PLATFORM", href: "/" },
  { label: "SOLUTIONS", href: "#" },
  { label: "INFRASTRUCTURE", href: "#" },
  { label: "SOC CONSOLE", href: "/dashboard" },
  { label: "DOCS", href: "#" },
];

const LogoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="text-primary"
    aria-hidden="true"
  >
    {/* Top Right Square */}
    <rect x="9" y="0" width="7" height="7" />
    {/* Bottom Left Square */}
    <rect x="0" y="9" width="7" height="7" />
    {/* Bottom Right Square */}
    <rect x="9" y="9" width="7" height="7" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
  >
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-outline-variant py-4"
          : "bg-transparent py-8"
      }`}
    >
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-start w-full">
          {/* Left Side: Brand Logo & Text */}
          <div className="flex items-center gap-3 pt-1.5 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <LogoIcon />
              </div>
              <span className="font-heading text-lg md:text-xl font-semibold tracking-wide text-primary transition-colors group-hover:text-primary/80">
                Nexora
              </span>
            </Link>
          </div>

          {/* Center-Left: Navigation Links (Vertical Stack) */}
          <div className="hidden md:flex flex-col gap-3 ml-12 md:ml-16 lg:ml-20">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`font-mono text-xs tracking-[0.18em] transition-all duration-300 uppercase hover:translate-x-1 ${
                  link.active
                    ? "text-primary font-medium"
                    : "text-white/40 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side: Arrow CTA (Desktop) */}
          <div className="hidden md:block ml-auto pt-0.5">
            <Link
              href="#get-access"
              className="group flex items-center justify-center p-2 hover:opacity-80 transition-opacity"
              aria-label="Get Access"
            >
              <ArrowIcon />
            </Link>
          </div>

          {/* Mobile Actions Container */}
          <div className="flex md:hidden items-center gap-3 ml-auto pt-0.5">
            <Link
              href="#get-access"
              className="group flex items-center justify-center p-1.5 hover:opacity-85"
              aria-label="Get Access"
            >
              <ArrowIcon />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex flex-col justify-center items-center w-8 h-8 rounded-sm text-primary hover:bg-white/5 transition-colors"
              aria-label="Toggle Menu"
            >
              <span
                className={`h-0.5 w-4 bg-current transform transition duration-300 ease-in-out ${
                  isOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
                }`}
              />
              <span
                className={`h-0.5 w-4 bg-current transform transition duration-300 ease-in-out mt-1 ${
                  isOpen ? "-rotate-45 -translate-y-0.5" : "translate-y-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? "max-h-[250px] opacity-100 mt-6 pt-4 border-t border-outline-variant" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4 pb-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`font-mono text-xs tracking-[0.18em] transition-colors duration-300 uppercase ${
                  link.active
                    ? "text-primary font-medium"
                    : "text-white/40 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
