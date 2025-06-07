"use client";

import { ReactNode, useEffect } from "react";
import { useScroll } from "@/contexts/ScrollContext";

interface ScrollContainerProps {
  children: ReactNode;
  sections: string[];
}

export const ScrollContainer = ({
  children,
  sections,
}: ScrollContainerProps) => {
  const { setSections } = useScroll();

  useEffect(() => {
    if (sections.length > 0) {
      setSections(sections);
    }
  }, [sections, setSections]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Main content */}
      <main className="relative">{children}</main>
    </div>
  );
};
