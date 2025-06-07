import { Metadata } from "next";
import { fetchAuthorByUsername } from "@/services/authorService";
import AuthorPageClient from "./AuthorPageClient";

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
  const author = await fetchAuthorByUsername(params.username);

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Author Not Found</h1>
          <p className="text-muted-foreground">
            The requested author could not be found.
          </p>
        </div>
      </div>
    );
  }

  return <AuthorPageClient params={{ username: params.username }} />;
}
