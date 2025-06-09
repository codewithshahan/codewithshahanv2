"use client";

import { RelatedTags } from "@/components/category/RelatedTags";

interface CategorySidebarProps {
  relatedCategories: Array<{
    name: string;
    slug: string;
    count: number;
    color?: string;
  }>;
  currentCategory: {
    name: string;
    slug: string;
    count: number;
    color?: string;
  } | null;
}

export function CategorySidebar({
  relatedCategories,
  currentCategory,
}: CategorySidebarProps) {
  return (
    <div className="sticky top-24 space-y-8">
      {/* Related Categories */}
      <div className="rounded-2xl p-6 bg-card border">
        <h3 className="text-lg font-semibold mb-4">Related Categories</h3>
        <RelatedTags
          tags={relatedCategories}
          currentTag={currentCategory?.slug || ""}
          limit={8}
          variant="pills"
          showCount={true}
        />
      </div>

      {/* Category Stats */}
      <div className="rounded-2xl p-6 bg-card border">
        <h3 className="text-lg font-semibold mb-4">Category Stats</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Articles</span>
            <span className="font-medium">{currentCategory?.count || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
