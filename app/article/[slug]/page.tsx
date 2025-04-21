import { notFound } from "next/navigation";
import { Metadata } from "next";
import PremiumArticleLayout from "@/components/article/PremiumArticleLayout";
import { articleService } from "@/services/articleService";
import LoadingIcon from "@/components/ui/LoadingIcon";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ApiClient } from "@/services/apiClient";

// Dynamically import the Navbar and Footer for better performance
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: true,
  loading: () => <NavbarSkeleton />,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: true,
});

// Import client components normally - they'll be rendered on the client side
// since they're marked with "use client" directive internally
import ArticleTransition from "@/components/article/ArticleTransition";
import FooterTransition from "@/components/article/FooterTransition";

// For debugging
console.log("Article page server component initialized");

// Navbar skeleton for loading state
function NavbarSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md h-16 md:h-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-full">
          <div className="w-40 h-6 bg-muted animate-pulse rounded-md"></div>
          <div className="hidden md:flex space-x-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-16 h-4 bg-muted animate-pulse rounded-md"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

// Generate metadata function for the article page
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  try {
    // Use the unified API client with caching
    const article = await ApiClient.articles.getArticle(params.slug);

    if (!article) {
      return {
        title: "Article Not Found",
        description: "The requested article could not be found.",
      };
    }

    return {
      title: article.title,
      description: article.brief || article.title,
      openGraph: {
        title: article.title,
        description: article.brief || article.title,
        images: [
          {
            url: article.coverImage,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        type: "article",
        publishedTime: article.publishedAt,
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: article.brief || article.title,
        images: [article.coverImage],
      },
    };
  } catch (error) {
    console.error(`Error generating metadata for slug ${params.slug}:`, error);
    return {
      title: "Article",
      description: "Read our latest article",
    };
  }
}

// The main article page component
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;

  try {
    // Fetch article data using the unified API client
    const article = await ApiClient.articles.getArticle(slug);

    // Return 404 if article not found
    if (!article) {
      notFound();
    }

    // Get comment count
    const commentCount = await ApiClient.articles.getCommentCount(slug);

    // Create props for the client component with proper markdown content
    const serializedArticle = {
      ...article,
      // Ensure dates are serialized properly
      publishedAt: article.publishedAt?.toString(),
      updatedAt: article.updatedAt?.toString(),
      // Make sure we're using the markdown content for our renderer
      content: article.content || "",
      // Add comment count for the comments feature
      commentCount: commentCount,
      // Make sure we include extracted table of contents if available
      tableOfContents: article.tableOfContents || [],
    };

    console.log("Article fetched successfully:", {
      title: article.title,
      contentLength: article.content?.length || 0,
      hasTableOfContents:
        Array.isArray(article.tableOfContents) &&
        article.tableOfContents.length > 0,
    });

    // Return integrated layout with Navbar, premium article content, and Footer
    return (
      <div className="flex flex-col min-h-screen">
        {/* Navbar with Suspense fallback */}
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>

        {/* Spacer for fixed navbar */}
        <div className="h-16 md:h-20"></div>

        {/* Creative transition between navbar and content */}
        <ArticleTransition />

        {/* Main content */}
        <main className="flex-grow">
          <PremiumArticleLayout article={serializedArticle} />
        </main>

        {/* Transition to Footer */}
        <FooterTransition />

        {/* Footer with Suspense fallback */}
        <Suspense
          fallback={<div className="h-40 bg-muted/30 animate-pulse"></div>}
        >
          <Footer />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    return (
      <div className="flex flex-col min-h-screen">
        {/* Include Navbar even in error state */}
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>

        {/* Spacer for fixed navbar */}
        <div className="h-16 md:h-20"></div>

        {/* Simple placeholder for transition */}
        <div className="relative w-full overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Error content */}
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-lg mx-auto">
              <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-lg dark:bg-gray-900/80 dark:backdrop-blur-lg dark:border-gray-800">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>

                  <h1 className="text-3xl font-bold mb-4">
                    Error Loading Article
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">
                    We encountered an error while loading this article. Please
                    try again later.
                  </p>

                  <div className="flex justify-center gap-4">
                    <a
                      href="/"
                      className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                      Back to Home
                    </a>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Simple footer transition placeholder */}
        <div className="relative w-full overflow-hidden mt-16 mb-8">
          <div className="container mx-auto px-4">
            <div className="h-px w-full bg-muted/30"></div>
          </div>
        </div>

        {/* Footer */}
        <Suspense
          fallback={<div className="h-40 bg-muted/30 animate-pulse"></div>}
        >
          <Footer />
        </Suspense>
      </div>
    );
  }
}

// Loading state with integrated layout
export function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Include Navbar in loading state */}
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20"></div>

      {/* Simple placeholder for transition */}
      <div className="relative w-full overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          {/* Hero section skeleton */}
          <div className="max-w-5xl mx-auto">
            <div className="w-full mb-28">
              {/* Author skeleton */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
                  <div>
                    <div className="w-40 h-4 bg-muted animate-pulse rounded-md"></div>
                    <div className="w-20 h-3 bg-muted/50 animate-pulse rounded-md mt-2"></div>
                  </div>
                </div>
              </div>

              {/* Cover image skeleton */}
              <div
                className="relative w-full"
                style={{ aspectRatio: "1000/400" }}
              >
                <div className="w-full h-full rounded-2xl bg-muted/60 animate-pulse overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-muted/80 to-transparent">
                    <div className="w-3/4 h-8 bg-muted/80 animate-pulse rounded-md"></div>
                    <div className="w-1/2 h-4 bg-muted/60 animate-pulse rounded-md mt-4"></div>
                  </div>
                </div>
              </div>

              {/* Tags skeleton */}
              <div className="absolute -bottom-16 left-0 right-0 flex justify-center z-30">
                <div className="inline-flex flex-wrap justify-center gap-3 py-3 px-5 rounded-2xl bg-muted/30 backdrop-blur-xl">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-20 h-8 rounded-full bg-muted/50 animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Article content skeleton */}
          <div className="max-w-3xl mx-auto mt-24 space-y-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-full h-4 bg-muted/30 animate-pulse rounded-md"
                style={{
                  width: `${Math.floor(Math.random() * 30) + 70}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              ></div>
            ))}

            <div className="w-full h-40 bg-muted/20 animate-pulse rounded-lg my-8"></div>

            {[...Array(8)].map((_, i) => (
              <div
                key={i + 5}
                className="w-full h-4 bg-muted/30 animate-pulse rounded-md"
                style={{
                  width: `${Math.floor(Math.random() * 30) + 70}%`,
                  animationDelay: `${(i + 5) * 100}ms`,
                }}
              ></div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <LoadingIcon className="w-16 h-16 text-primary" />
          </div>
        </div>
      </main>

      {/* Simple footer transition placeholder */}
      <div className="relative w-full overflow-hidden mt-16 mb-8">
        <div className="container mx-auto px-4">
          <div className="h-px w-full bg-muted/30 animate-pulse"></div>
        </div>
      </div>

      {/* Footer */}
      <Suspense
        fallback={<div className="h-40 bg-muted/30 animate-pulse"></div>}
      >
        <Footer />
      </Suspense>
    </div>
  );
}

// Debug helper function
function logError(location: string, error: any) {
  console.error(`Error in ${location}:`, error);
  console.error(`Error name: ${error.name}, message: ${error.message}`);
  console.error(`Stack trace: ${error.stack}`);
  if (error.response) {
    console.error(`Response status: ${error.response.status}`);
    console.error(`Response data:`, error.response.data);
  }
}
