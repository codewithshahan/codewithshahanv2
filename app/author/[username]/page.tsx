import { Metadata } from "next";
import { fetchAuthorByUsername } from "@/services/authorService";
import AuthorPageClient from "./AuthorPageClient";

// Server component for metadata generation
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const { username } = params;

  // Log the params at the server level
  console.log("Server component params:", params);

  // Fetch author data for metadata
  try {
    const author = await fetchAuthorByUsername(username);

    const title = `${author.name} - Developer & Technical Writer`;
    const description =
      author.bio?.substring(0, 155) ||
      `Explore articles, tutorials, and insights from ${username} on web development, programming, and technology topics.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        url: `https://codewithshahan.com/author/${username}`,
        images: author.avatar ? [{ url: author.avatar }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: author.avatar ? [author.avatar] : [],
      },
      alternates: {
        canonical: `https://codewithshahan.com/author/${username}`,
      },
    };
  } catch (error) {
    // Fallback metadata if author fetch fails
    return {
      title: "Author Profile",
      description: `Explore articles and insights from ${username} on web development and programming.`,
    };
  }
}

// Server component page - delegates rendering to client component
export default function AuthorPage({
  params,
}: {
  params: { username: string };
}) {
  // Log the params before passing to client component
  console.log("Passing params to client:", params);

  // Explicitly extract and pass the username to ensure it's defined
  // Use codewithshahan as a fallback if the URL parameter is undefined
  const username = params?.username || "codewithshahan";

  // If params.username is undefined but we're using the fallback, log a warning
  if (!params?.username) {
    console.warn(
      "Username parameter is missing, using fallback: codewithshahan"
    );
  }

  // Always pass a valid username to the client component
  return <AuthorPageClient params={{ username }} />;
}
