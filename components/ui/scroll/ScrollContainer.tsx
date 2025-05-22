"use client";

import { ReactNode } from "react";
import { ScrollIndicator } from "@/components/ui/scroll/ScrollIndicator";

interface ScrollContainerProps {
  children: ReactNode;
  sections: string[];
}

export const ScrollContainer = ({
  children,
  sections,
}: ScrollContainerProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Fixed scroll indicator dots in top center with higher z-index */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999]">
        <ScrollIndicator sections={sections} />
      </div>

      {/* Main content */}
      <main className="relative">{children}</main>
    </div>
  );
};
