"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ScrollContextType {
  currentSection: string;
  sections: string[];
  setSections: (sections: string[]) => void;
}

const ScrollContext = createContext<ScrollContextType>({
  currentSection: "",
  sections: [],
  setSections: () => {},
});

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [currentSection, setCurrentSection] = useState("");
  const [sections, setSections] = useState<string[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-50% 0px",
        threshold: 0,
      }
    );

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
    };
  }, [sections]);

  return (
    <ScrollContext.Provider
      value={{
        currentSection,
        sections,
        setSections,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

export const useScroll = () => useContext(ScrollContext);
