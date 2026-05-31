"use client";

import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}

export default function RevealWrapper({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: RevealWrapperProps) {
  const { ref, isVisible } = useRevealOnScroll();

  const style: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(30px)",
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  };

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
