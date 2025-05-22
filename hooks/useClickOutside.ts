"use client";

import { useEffect, RefObject } from "react";

/**
 * Hook that handles clicks outside of the specified element
 * @param ref - The reference to the element to detect outside clicks
 * @param callback - The callback function to execute when an outside click is detected
 */
export default function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void
): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Unbind the event listener on cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
