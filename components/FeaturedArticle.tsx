"use client";

import ArticlePreview from "./ArticlePreview";

interface FeaturedArticleProps {
  article: {
    title: string;
    slug: string;
    coverImage: string;
    description: string;
    readingTime: string;
    publishedAt: string;
    author: {
      name: string;
      username: string;
      avatar: string;
    };
    category: {
      name: string;
      slug: string;
    };
    tags: Array<{
      name: string;
      slug: string;
      color: string;
    }>;
  };
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  return (
    <div className="mb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center">Featured Article</h2>
        <div className="mt-2 w-20 h-1 bg-primary mx-auto rounded-full"></div>
      </div>
      <ArticlePreview article={article} featured={true} />
    </div>
  );
};

export default FeaturedArticle;
