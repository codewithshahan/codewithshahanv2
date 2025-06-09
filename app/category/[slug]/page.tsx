import { Suspense } from "react";
import { SimplifiedHashnodeApi } from "@/services/hashnodeApi";
import { HashnodeArticle } from "@/services/articleCacheService";
import { getArticleCategories } from "@/services/articleCacheService";
import { CategoryHero } from "@/app/category/[slug]/components/CategoryHero";
import { CategoryArticles } from "@/app/category/[slug]/components/CategoryArticles";
import { CategorySidebar } from "@/app/category/[slug]/components/CategorySidebar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Server Component
export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Fetch initial data on the server with parallel requests
  const [categories, initialArticles] = await Promise.all([
    getArticleCategories(),
    SimplifiedHashnodeApi.fetchArticles(8).then((res) =>
      res.articles.filter((article) =>
        article.tags?.some((tag) => tag.slug === slug)
      )
    ),
  ]);

  // Find current category
  const currentCategory = categories.find((cat) => cat.slug === slug);
  const relatedCategories = categories
    .filter((cat) => cat.slug !== slug)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Transform category data to match expected format
  const formattedCategory = currentCategory
    ? {
        name: currentCategory.name,
        slug: currentCategory.slug,
        description: `Articles about ${currentCategory.name}`,
        color: currentCategory.color || "#000000",
        icon: null,
      }
    : null;

  return (
    <div className="min-h-screen">
      {/* Hero Section - Server Rendered */}
      <CategoryHero
        category={formattedCategory}
        articleCount={currentCategory?.count || 0}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Articles Grid - Client Component with Suspense */}
          <div className="lg:col-span-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <LoadingSpinner />
                </div>
              }
            >
              <CategoryArticles
                initialArticles={initialArticles}
                categorySlug={slug}
              />
            </Suspense>
          </div>

          {/* Sidebar - Server Rendered */}
          <div className="lg:col-span-4">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[200px]">
                  <LoadingSpinner />
                </div>
              }
            >
              <CategorySidebar
                relatedCategories={relatedCategories}
                currentCategory={currentCategory}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
