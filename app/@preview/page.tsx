import { Suspense } from "react";
import { headers } from "next/headers";

async function getContent(pathname: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}${pathname}`,
      {
        next: { revalidate: 0 },
        headers: {
          "x-preview": "true",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch content");

    return await response.text();
  } catch (error) {
    console.error("Error fetching preview content:", error);
    return null;
  }
}

export default async function PreviewPage() {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "/";

  const content = await getContent(pathname);

  if (!content) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-gray-500">Failed to load preview</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full bg-background/80 backdrop-blur-xl animate-pulse" />
      }
    >
      <div
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Suspense>
  );
}
