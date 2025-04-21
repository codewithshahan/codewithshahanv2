"use client";

import { create, StateCreator } from "zustand";

interface NavigationState {
  isNavigating: boolean;
  navigatingTo: string | null;
  navigatingFromPage: string | null;
  startNavigation: (url: string) => void;
  completeNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>(
  (set: StateCreator<NavigationState>[0]) => ({
    isNavigating: false,
    navigatingTo: null,
    navigatingFromPage: null,
    startNavigation: (url: string) =>
      set({
        isNavigating: true,
        navigatingTo: url,
      }),
    completeNavigation: () =>
      set({
        isNavigating: false,
        navigatingTo: null,
        navigatingFromPage: null,
      }),
  })
);
