import ArticleClient from "./ArticleClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles | CodeWithShahan",
  description:
    "Explore our collection of insightful articles on programming, design, and technology.",
};

export default function ArticlesPage() {
  return <ArticleClient />;
}
