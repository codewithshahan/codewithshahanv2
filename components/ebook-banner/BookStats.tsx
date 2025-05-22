import { motion } from "framer-motion";
import { BookStatsProps } from "./types";
import { BookOpen, Users, Star, Clock } from "lucide-react";
import { MiniCard } from "./MiniCard";

export const BookStats = ({ isDark }: BookStatsProps) => {
  const stats = [
    {
      icon: BookOpen,
      title: "Pages",
      value: "320",
      description: "Comprehensive content",
    },
    {
      icon: Users,
      title: "Readers",
      value: "10K+",
      description: "Active learners",
    },
    {
      icon: Star,
      title: "Rating",
      value: "4.9",
      description: "Based on reviews",
    },
    {
      icon: Clock,
      title: "Read Time",
      value: "8h",
      description: "Average completion",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
        >
          <MiniCard
            isDark={isDark}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            description={stat.description}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
