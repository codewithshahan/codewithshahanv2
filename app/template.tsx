import { Suspense } from "react";
import ProgressiveLoader from "@/components/ProgressiveLoader";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <Suspense>
        <ProgressiveLoader>{children}</ProgressiveLoader>
      </Suspense>
    </div>
  );
}
