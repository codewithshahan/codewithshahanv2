"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import PremiumMacOSRichTextRenderer from "@/components/markdown/PremiumMacOSRichTextRenderer";

interface InfoCardContainerProps {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  className?: string;
  isNew?: boolean;
  isPopular?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isLimited?: boolean;
  isExclusive?: boolean;
  isFeatured?: boolean;
  isRecommended?: boolean;
  isTopRated?: boolean;
  isMostViewed?: boolean;
  isMostLiked?: boolean;
  isMostShared?: boolean;
  isMostCommented?: boolean;
  isMostBookmarked?: boolean;
  isMostDownloaded?: boolean;
  isMostPurchased?: boolean;
  isMostRated?: boolean;
  isMostReviewed?: boolean;
  isMostWatched?: boolean;
  isMostListened?: boolean;
  isMostRead?: boolean;
  isMostPlayed?: boolean;
  isMostStreamed?: boolean;
  isMostViewedToday?: boolean;
  isMostViewedThisWeek?: boolean;
  isMostViewedThisMonth?: boolean;
  isMostViewedThisYear?: boolean;
  isMostViewedAllTime?: boolean;
  isMostLikedToday?: boolean;
  isMostLikedThisWeek?: boolean;
  isMostLikedThisMonth?: boolean;
  isMostLikedThisYear?: boolean;
  isMostLikedAllTime?: boolean;
  isMostSharedToday?: boolean;
  isMostSharedThisWeek?: boolean;
  isMostSharedThisMonth?: boolean;
  isMostSharedThisYear?: boolean;
  isMostSharedAllTime?: boolean;
  isMostCommentedToday?: boolean;
  isMostCommentedThisWeek?: boolean;
  isMostCommentedThisMonth?: boolean;
  isMostCommentedThisYear?: boolean;
  isMostCommentedAllTime?: boolean;
  isMostBookmarkedToday?: boolean;
  isMostBookmarkedThisWeek?: boolean;
  isMostBookmarkedThisMonth?: boolean;
  isMostBookmarkedThisYear?: boolean;
  isMostBookmarkedAllTime?: boolean;
  isMostDownloadedToday?: boolean;
  isMostDownloadedThisWeek?: boolean;
  isMostDownloadedThisMonth?: boolean;
  isMostDownloadedThisYear?: boolean;
  isMostDownloadedAllTime?: boolean;
  isMostPurchasedToday?: boolean;
  isMostPurchasedThisWeek?: boolean;
  isMostPurchasedThisMonth?: boolean;
  isMostPurchasedThisYear?: boolean;
  isMostPurchasedAllTime?: boolean;
  isMostRatedToday?: boolean;
  isMostRatedThisWeek?: boolean;
  isMostRatedThisMonth?: boolean;
  isMostRatedThisYear?: boolean;
  isMostRatedAllTime?: boolean;
  isMostReviewedToday?: boolean;
  isMostReviewedThisWeek?: boolean;
  isMostReviewedThisMonth?: boolean;
  isMostReviewedThisYear?: boolean;
  isMostReviewedAllTime?: boolean;
  isMostWatchedToday?: boolean;
  isMostWatchedThisWeek?: boolean;
  isMostWatchedThisMonth?: boolean;
  isMostWatchedThisYear?: boolean;
  isMostWatchedAllTime?: boolean;
  isMostListenedToday?: boolean;
  isMostListenedThisWeek?: boolean;
  isMostListenedThisMonth?: boolean;
  isMostListenedThisYear?: boolean;
  isMostListenedAllTime?: boolean;
  isMostReadToday?: boolean;
  isMostReadThisWeek?: boolean;
  isMostReadThisMonth?: boolean;
  isMostReadThisYear?: boolean;
  isMostReadAllTime?: boolean;
  isMostPlayedToday?: boolean;
  isMostPlayedThisWeek?: boolean;
  isMostPlayedThisMonth?: boolean;
  isMostPlayedThisYear?: boolean;
  isMostPlayedAllTime?: boolean;
  isMostStreamedToday?: boolean;
  isMostStreamedThisWeek?: boolean;
  isMostStreamedThisMonth?: boolean;
  isMostStreamedThisYear?: boolean;
  isMostStreamedAllTime?: boolean;
}

const InfoCardContainer: React.FC<InfoCardContainerProps> = ({
  title,
  description,
  price,
  imageUrl,
  className,
  isNew,
  isPopular,
  isBestSeller,
  isTrending,
  isLimited,
  isExclusive,
  isFeatured,
  isRecommended,
  isTopRated,
  isMostViewed,
  isMostLiked,
  isMostShared,
  isMostCommented,
  isMostBookmarked,
  isMostDownloaded,
  isMostPurchased,
  isMostRated,
  isMostReviewed,
  isMostWatched,
  isMostListened,
  isMostRead,
  isMostPlayed,
  isMostStreamed,
  isMostViewedToday,
  isMostViewedThisWeek,
  isMostViewedThisMonth,
  isMostViewedThisYear,
  isMostViewedAllTime,
  isMostLikedToday,
  isMostLikedThisWeek,
  isMostLikedThisMonth,
  isMostLikedThisYear,
  isMostLikedAllTime,
  isMostSharedToday,
  isMostSharedThisWeek,
  isMostSharedThisMonth,
  isMostSharedThisYear,
  isMostSharedAllTime,
  isMostCommentedToday,
  isMostCommentedThisWeek,
  isMostCommentedThisMonth,
  isMostCommentedThisYear,
  isMostCommentedAllTime,
  isMostBookmarkedToday,
  isMostBookmarkedThisWeek,
  isMostBookmarkedThisMonth,
  isMostBookmarkedThisYear,
  isMostBookmarkedAllTime,
  isMostDownloadedToday,
  isMostDownloadedThisWeek,
  isMostDownloadedThisMonth,
  isMostDownloadedThisYear,
  isMostDownloadedAllTime,
  isMostPurchasedToday,
  isMostPurchasedThisWeek,
  isMostPurchasedThisMonth,
  isMostPurchasedThisYear,
  isMostPurchasedAllTime,
  isMostRatedToday,
  isMostRatedThisWeek,
  isMostRatedThisMonth,
  isMostRatedThisYear,
  isMostRatedAllTime,
  isMostReviewedToday,
  isMostReviewedThisWeek,
  isMostReviewedThisMonth,
  isMostReviewedThisYear,
  isMostReviewedAllTime,
  isMostWatchedToday,
  isMostWatchedThisWeek,
  isMostWatchedThisMonth,
  isMostWatchedThisYear,
  isMostWatchedAllTime,
  isMostListenedToday,
  isMostListenedThisWeek,
  isMostListenedThisMonth,
  isMostListenedThisYear,
  isMostListenedAllTime,
  isMostReadToday,
  isMostReadThisWeek,
  isMostReadThisMonth,
  isMostReadThisYear,
  isMostReadAllTime,
  isMostPlayedToday,
  isMostPlayedThisWeek,
  isMostPlayedThisMonth,
  isMostPlayedThisYear,
  isMostPlayedAllTime,
  isMostStreamedToday,
  isMostStreamedThisWeek,
  isMostStreamedThisMonth,
  isMostStreamedThisYear,
  isMostStreamedAllTime,
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const getBadgeColor = () => {
    if (isNew) return "bg-blue-500";
    if (isPopular) return "bg-purple-500";
    if (isBestSeller) return "bg-yellow-500";
    if (isTrending) return "bg-red-500";
    if (isLimited) return "bg-orange-500";
    if (isExclusive) return "bg-pink-500";
    if (isFeatured) return "bg-indigo-500";
    if (isRecommended) return "bg-green-500";
    if (isTopRated) return "bg-teal-500";
    if (isMostViewed) return "bg-cyan-500";
    if (isMostLiked) return "bg-emerald-500";
    if (isMostShared) return "bg-violet-500";
    if (isMostCommented) return "bg-fuchsia-500";
    if (isMostBookmarked) return "bg-rose-500";
    if (isMostDownloaded) return "bg-sky-500";
    if (isMostPurchased) return "bg-blue-600";
    if (isMostRated) return "bg-indigo-600";
    if (isMostReviewed) return "bg-violet-600";
    if (isMostWatched) return "bg-purple-600";
    if (isMostListened) return "bg-fuchsia-600";
    if (isMostRead) return "bg-pink-600";
    if (isMostPlayed) return "bg-rose-600";
    if (isMostStreamed) return "bg-red-600";
    if (isMostViewedToday) return "bg-orange-600";
    if (isMostViewedThisWeek) return "bg-amber-600";
    if (isMostViewedThisMonth) return "bg-yellow-600";
    if (isMostViewedThisYear) return "bg-lime-600";
    if (isMostViewedAllTime) return "bg-green-600";
    if (isMostLikedToday) return "bg-emerald-600";
    if (isMostLikedThisWeek) return "bg-teal-600";
    if (isMostLikedThisMonth) return "bg-cyan-600";
    if (isMostLikedThisYear) return "bg-sky-600";
    if (isMostLikedAllTime) return "bg-blue-600";
    if (isMostSharedToday) return "bg-indigo-600";
    if (isMostSharedThisWeek) return "bg-violet-600";
    if (isMostSharedThisMonth) return "bg-purple-600";
    if (isMostSharedThisYear) return "bg-fuchsia-600";
    if (isMostSharedAllTime) return "bg-pink-600";
    if (isMostCommentedToday) return "bg-rose-600";
    if (isMostCommentedThisWeek) return "bg-red-600";
    if (isMostCommentedThisMonth) return "bg-orange-600";
    if (isMostCommentedThisYear) return "bg-amber-600";
    if (isMostCommentedAllTime) return "bg-yellow-600";
    if (isMostBookmarkedToday) return "bg-lime-600";
    if (isMostBookmarkedThisWeek) return "bg-green-600";
    if (isMostBookmarkedThisMonth) return "bg-emerald-600";
    if (isMostBookmarkedThisYear) return "bg-teal-600";
    if (isMostBookmarkedAllTime) return "bg-cyan-600";
    if (isMostDownloadedToday) return "bg-sky-600";
    if (isMostDownloadedThisWeek) return "bg-blue-600";
    if (isMostDownloadedThisMonth) return "bg-indigo-600";
    if (isMostDownloadedThisYear) return "bg-violet-600";
    if (isMostDownloadedAllTime) return "bg-purple-600";
    if (isMostPurchasedToday) return "bg-fuchsia-600";
    if (isMostPurchasedThisWeek) return "bg-pink-600";
    if (isMostPurchasedThisMonth) return "bg-rose-600";
    if (isMostPurchasedThisYear) return "bg-red-600";
    if (isMostPurchasedAllTime) return "bg-orange-600";
    if (isMostRatedToday) return "bg-amber-600";
    if (isMostRatedThisWeek) return "bg-yellow-600";
    if (isMostRatedThisMonth) return "bg-lime-600";
    if (isMostRatedThisYear) return "bg-green-600";
    if (isMostRatedAllTime) return "bg-emerald-600";
    if (isMostReviewedToday) return "bg-teal-600";
    if (isMostReviewedThisWeek) return "bg-cyan-600";
    if (isMostReviewedThisMonth) return "bg-sky-600";
    if (isMostReviewedThisYear) return "bg-blue-600";
    if (isMostReviewedAllTime) return "bg-indigo-600";
    if (isMostWatchedToday) return "bg-violet-600";
    if (isMostWatchedThisWeek) return "bg-purple-600";
    if (isMostWatchedThisMonth) return "bg-fuchsia-600";
    if (isMostWatchedThisYear) return "bg-pink-600";
    if (isMostWatchedAllTime) return "bg-rose-600";
    if (isMostListenedToday) return "bg-red-600";
    if (isMostListenedThisWeek) return "bg-orange-600";
    if (isMostListenedThisMonth) return "bg-amber-600";
    if (isMostListenedThisYear) return "bg-yellow-600";
    if (isMostListenedAllTime) return "bg-lime-600";
    if (isMostReadToday) return "bg-green-600";
    if (isMostReadThisWeek) return "bg-emerald-600";
    if (isMostReadThisMonth) return "bg-teal-600";
    if (isMostReadThisYear) return "bg-cyan-600";
    if (isMostReadAllTime) return "bg-sky-600";
    if (isMostPlayedToday) return "bg-blue-600";
    if (isMostPlayedThisWeek) return "bg-indigo-600";
    if (isMostPlayedThisMonth) return "bg-violet-600";
    if (isMostPlayedThisYear) return "bg-purple-600";
    if (isMostPlayedAllTime) return "bg-fuchsia-600";
    if (isMostStreamedToday) return "bg-pink-600";
    if (isMostStreamedThisWeek) return "bg-rose-600";
    if (isMostStreamedThisMonth) return "bg-red-600";
    if (isMostStreamedThisYear) return "bg-orange-600";
    if (isMostStreamedAllTime) return "bg-amber-600";
    return "bg-gray-500";
  };

  const getBadgeText = () => {
    if (isNew) return "New";
    if (isPopular) return "Popular";
    if (isBestSeller) return "Best Seller";
    if (isTrending) return "Trending";
    if (isLimited) return "Limited";
    if (isExclusive) return "Exclusive";
    if (isFeatured) return "Featured";
    if (isRecommended) return "Recommended";
    if (isTopRated) return "Top Rated";
    if (isMostViewed) return "Most Viewed";
    if (isMostLiked) return "Most Liked";
    if (isMostShared) return "Most Shared";
    if (isMostCommented) return "Most Commented";
    if (isMostBookmarked) return "Most Bookmarked";
    if (isMostDownloaded) return "Most Downloaded";
    if (isMostPurchased) return "Most Purchased";
    if (isMostRated) return "Most Rated";
    if (isMostReviewed) return "Most Reviewed";
    if (isMostWatched) return "Most Watched";
    if (isMostListened) return "Most Listened";
    if (isMostRead) return "Most Read";
    if (isMostPlayed) return "Most Played";
    if (isMostStreamed) return "Most Streamed";
    if (isMostViewedToday) return "Most Viewed Today";
    if (isMostViewedThisWeek) return "Most Viewed This Week";
    if (isMostViewedThisMonth) return "Most Viewed This Month";
    if (isMostViewedThisYear) return "Most Viewed This Year";
    if (isMostViewedAllTime) return "Most Viewed All Time";
    if (isMostLikedToday) return "Most Liked Today";
    if (isMostLikedThisWeek) return "Most Liked This Week";
    if (isMostLikedThisMonth) return "Most Liked This Month";
    if (isMostLikedThisYear) return "Most Liked This Year";
    if (isMostLikedAllTime) return "Most Liked All Time";
    if (isMostSharedToday) return "Most Shared Today";
    if (isMostSharedThisWeek) return "Most Shared This Week";
    if (isMostSharedThisMonth) return "Most Shared This Month";
    if (isMostSharedThisYear) return "Most Shared This Year";
    if (isMostSharedAllTime) return "Most Shared All Time";
    if (isMostCommentedToday) return "Most Commented Today";
    if (isMostCommentedThisWeek) return "Most Commented This Week";
    if (isMostCommentedThisMonth) return "Most Commented This Month";
    if (isMostCommentedThisYear) return "Most Commented This Year";
    if (isMostCommentedAllTime) return "Most Commented All Time";
    if (isMostBookmarkedToday) return "Most Bookmarked Today";
    if (isMostBookmarkedThisWeek) return "Most Bookmarked This Week";
    if (isMostBookmarkedThisMonth) return "Most Bookmarked This Month";
    if (isMostBookmarkedThisYear) return "Most Bookmarked This Year";
    if (isMostBookmarkedAllTime) return "Most Bookmarked All Time";
    if (isMostDownloadedToday) return "Most Downloaded Today";
    if (isMostDownloadedThisWeek) return "Most Downloaded This Week";
    if (isMostDownloadedThisMonth) return "Most Downloaded This Month";
    if (isMostDownloadedThisYear) return "Most Downloaded This Year";
    if (isMostDownloadedAllTime) return "Most Downloaded All Time";
    if (isMostPurchasedToday) return "Most Purchased Today";
    if (isMostPurchasedThisWeek) return "Most Purchased This Week";
    if (isMostPurchasedThisMonth) return "Most Purchased This Month";
    if (isMostPurchasedThisYear) return "Most Purchased This Year";
    if (isMostPurchasedAllTime) return "Most Purchased All Time";
    if (isMostRatedToday) return "Most Rated Today";
    if (isMostRatedThisWeek) return "Most Rated This Week";
    if (isMostRatedThisMonth) return "Most Rated This Month";
    if (isMostRatedThisYear) return "Most Rated This Year";
    if (isMostRatedAllTime) return "Most Rated All Time";
    if (isMostReviewedToday) return "Most Reviewed Today";
    if (isMostReviewedThisWeek) return "Most Reviewed This Week";
    if (isMostReviewedThisMonth) return "Most Reviewed This Month";
    if (isMostReviewedThisYear) return "Most Reviewed This Year";
    if (isMostReviewedAllTime) return "Most Reviewed All Time";
    if (isMostWatchedToday) return "Most Watched Today";
    if (isMostWatchedThisWeek) return "Most Watched This Week";
    if (isMostWatchedThisMonth) return "Most Watched This Month";
    if (isMostWatchedThisYear) return "Most Watched This Year";
    if (isMostWatchedAllTime) return "Most Watched All Time";
    if (isMostListenedToday) return "Most Listened Today";
    if (isMostListenedThisWeek) return "Most Listened This Week";
    if (isMostListenedThisMonth) return "Most Listened This Month";
    if (isMostListenedThisYear) return "Most Listened This Year";
    if (isMostListenedAllTime) return "Most Listened All Time";
    if (isMostReadToday) return "Most Read Today";
    if (isMostReadThisWeek) return "Most Read This Week";
    if (isMostReadThisMonth) return "Most Read This Month";
    if (isMostReadThisYear) return "Most Read This Year";
    if (isMostReadAllTime) return "Most Read All Time";
    if (isMostPlayedToday) return "Most Played Today";
    if (isMostPlayedThisWeek) return "Most Played This Week";
    if (isMostPlayedThisMonth) return "Most Played This Month";
    if (isMostPlayedThisYear) return "Most Played This Year";
    if (isMostPlayedAllTime) return "Most Played All Time";
    if (isMostStreamedToday) return "Most Streamed Today";
    if (isMostStreamedThisWeek) return "Most Streamed This Week";
    if (isMostStreamedThisMonth) return "Most Streamed This Month";
    if (isMostStreamedThisYear) return "Most Streamed This Year";
    if (isMostStreamedAllTime) return "Most Streamed All Time";
    return "";
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 shadow-2xl",
        className
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50"></div>
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
        {(isNew ||
          isPopular ||
          isBestSeller ||
          isTrending ||
          isLimited ||
          isExclusive ||
          isFeatured ||
          isRecommended ||
          isTopRated ||
          isMostViewed ||
          isMostLiked ||
          isMostShared ||
          isMostCommented ||
          isMostBookmarked ||
          isMostDownloaded ||
          isMostPurchased ||
          isMostRated ||
          isMostReviewed ||
          isMostWatched ||
          isMostListened ||
          isMostRead ||
          isMostPlayed ||
          isMostStreamed ||
          isMostViewedToday ||
          isMostViewedThisWeek ||
          isMostViewedThisMonth ||
          isMostViewedThisYear ||
          isMostViewedAllTime ||
          isMostLikedToday ||
          isMostLikedThisWeek ||
          isMostLikedThisMonth ||
          isMostLikedThisYear ||
          isMostLikedAllTime ||
          isMostSharedToday ||
          isMostSharedThisWeek ||
          isMostSharedThisMonth ||
          isMostSharedThisYear ||
          isMostSharedAllTime ||
          isMostCommentedToday ||
          isMostCommentedThisWeek ||
          isMostCommentedThisMonth ||
          isMostCommentedThisYear ||
          isMostCommentedAllTime ||
          isMostBookmarkedToday ||
          isMostBookmarkedThisWeek ||
          isMostBookmarkedThisMonth ||
          isMostBookmarkedThisYear ||
          isMostBookmarkedAllTime ||
          isMostDownloadedToday ||
          isMostDownloadedThisWeek ||
          isMostDownloadedThisMonth ||
          isMostDownloadedThisYear ||
          isMostDownloadedAllTime ||
          isMostPurchasedToday ||
          isMostPurchasedThisWeek ||
          isMostPurchasedThisMonth ||
          isMostPurchasedThisYear ||
          isMostPurchasedAllTime ||
          isMostRatedToday ||
          isMostRatedThisWeek ||
          isMostRatedThisMonth ||
          isMostRatedThisYear ||
          isMostRatedAllTime ||
          isMostReviewedToday ||
          isMostReviewedThisWeek ||
          isMostReviewedThisMonth ||
          isMostReviewedThisYear ||
          isMostReviewedAllTime ||
          isMostWatchedToday ||
          isMostWatchedThisWeek ||
          isMostWatchedThisMonth ||
          isMostWatchedThisYear ||
          isMostWatchedAllTime ||
          isMostListenedToday ||
          isMostListenedThisWeek ||
          isMostListenedThisMonth ||
          isMostListenedThisYear ||
          isMostListenedAllTime ||
          isMostReadToday ||
          isMostReadThisWeek ||
          isMostReadThisMonth ||
          isMostReadThisYear ||
          isMostReadAllTime ||
          isMostPlayedToday ||
          isMostPlayedThisWeek ||
          isMostPlayedThisMonth ||
          isMostPlayedThisYear ||
          isMostPlayedAllTime ||
          isMostStreamedToday ||
          isMostStreamedThisWeek ||
          isMostStreamedThisMonth ||
          isMostStreamedThisYear ||
          isMostStreamedAllTime) && (
          <div className="absolute top-4 right-4">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg",
                getBadgeColor()
              )}
            >
              {getBadgeText()}
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <div className="text-gray-300 mb-4">
          <PremiumMacOSRichTextRenderer
            content={description}
            enablePremiumFeatures={false}
            enableTextToSpeech={false}
            enableAIHighlights={false}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">{price}</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default InfoCardContainer;
