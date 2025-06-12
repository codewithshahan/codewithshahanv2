import { Metadata } from "next";
import { fetchAuthorByUsername } from "@/services/authorService";
import AuthorPageClient from "./AuthorPageClient";
import { Suspense } from "react";
import AuthorSkeleton from "./AuthorSkeleton";

// Server component for metadata generation
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const author = await fetchAuthorByUsername(params.username);

  if (!author) {
    return {
      title: "Author Not Found",
      description: "The requested author could not be found.",
    };
  }

  return {
    title: `${author.name} - Code With Shahan`,
    description: author.bio || `Articles and tutorials by ${author.name}`,
    openGraph: {
      title: `${author.name} - Code With Shahan`,
      description: author.bio || `Articles and tutorials by ${author.name}`,
      images: author.avatar ? [author.avatar] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} - Code With Shahan`,
      description: author.bio || `Articles and tutorials by ${author.name}`,
      images: author.avatar ? [author.avatar] : [],
    },
  };
}

// Server component page - delegates rendering to client component
export default async function AuthorPage({
  params,
}: {
  params: { username: string };
}) {
  return (
    <Suspense fallback={<AuthorSkeleton />}>
      <AuthorPageClient params={{ username: params.username }} />
    </Suspense>
  );
}
