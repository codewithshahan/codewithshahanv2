import { notFound } from "next/navigation";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleTransition from "@/components/article/ArticleTransition";
import FooterTransition from "@/components/article/FooterTransition";
import { Suspense } from "react";

import XArticleLayout from "@/components/article/XArticleLayout";
import { getArticleBySlug } from "@/services/articleCacheService";
import ArticleSkeleton from "@/components/article/ArticleSkeketon";

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }
  // Normalize coverImage for metadata
  const coverImageUrl =
    typeof article.coverImage === "string" && article.coverImage
      ? article.coverImage
      : undefined;
  return {
    title: article.title,
    description: article.brief || article.title,
    openGraph: {
      title: article.title,
      description: article.brief || article.title,
      images: coverImageUrl
        ? [
            {
              url: coverImageUrl,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
      type: "article",
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.brief || article.title,
      images: coverImageUrl ? [coverImageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  // Robust normalization for XArticleLayout
  const xArticleProps = {
    title: article.title ?? "",
    author: {
      name: article.author?.name ?? "Unknown",
      profilePicture: article.author?.image ?? "",
      bio: article.author?.bio ?? "",
    },
    publishedAt: article.publishedAt ?? "",
    coverImage:
      article.coverImage && typeof article.coverImage === "string"
        ? { url: article.coverImage }
        : undefined,
    content: article.content ?? "",
    tags: Array.isArray(article.tags)
      ? article.tags.map((tag: any) => ({
          name: tag.name,
          slug: tag.slug,
        }))
      : [],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="h-16 md:h-20" />
      <ArticleTransition />
      <main className="flex-grow">
        <Suspense fallback={<ArticleSkeleton />}>
          <XArticleLayout {...xArticleProps} />
        </Suspense>
      </main>
      <FooterTransition />
      <Footer />
    </div>
  );
}
