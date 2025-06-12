"use client";

import { usePathname } from "next/navigation";

export function useNavigationLoading() {
  const pathname = usePathname();
  return false;
}
