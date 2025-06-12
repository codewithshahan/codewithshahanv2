import { notFound } from "next/navigation";
import { Metadata } from "next";
import PremiumArticleLayout from "@/components/article/PremiumArticleLayout";
import { articleService } from "@/services/articleService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleTransition from "@/components/article/ArticleTransition";
import FooterTransition from "@/components/article/FooterTransition";

// For debugging
console.log("Article page server component initialized");

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
    const article = await articleService.fetchArticle(params.slug);

    if (!article) {
      return {
        title: "Article Not Found",
        description: "The requested article could not be found.",
      };
    }

    return {
      title: article.title,
      description: article.description || article.title,
      openGraph: {
        title: article.title,
        description: article.description || article.title,
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
        description: article.description || article.title,
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
    // Fetch article data
    const article = await articleService.fetchArticle(slug);

    // Return 404 if article not found
    if (!article) {
      notFound();
    }

    // Create props for the client component with proper markdown content
    const serializedArticle = {
      ...article,
      // Ensure dates are serialized properly
      publishedAt: article.publishedAt?.toString(),
      updatedAt: article.updatedAt?.toString(),
      // Make sure we're using the markdown content for our renderer
      content: article.content || "",
      // Add comment count for the comments feature
      commentCount: (await articleService.getArticleCommentCount?.(slug)) || 0,
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
        <Navbar />

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

        <Footer />
      </div>
    );
  } catch (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />

        {/* Spacer for fixed navbar */}
        <div className="h-16 md:h-20"></div>

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
                  <h1 className="text-2xl font-bold mb-4">
                    Error Loading Article
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    We encountered an error while loading this article. Please
                    try again later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }
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
