import { motion } from "framer-motion";
import { MobileLayoutProps } from "./types";
import { BookCover } from "./BookCover";
import { BookContent } from "./BookContent";
import { Testimonial } from "./Testimonial";
import { WindowControls } from "./WindowControls";

export const MobileLayout = ({
  isDark,
  bookControls,
  containerControls,
  imageError,
  setImageError,
}: MobileLayoutProps) => {
  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      initial="initial"
      animate="animate"
      variants={containerControls}
    >
      {/* Window Controls */}
      <div className="absolute top-4 right-4 z-20">
        <WindowControls isDark={isDark} />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Book Cover */}
        <motion.div
          className="relative"
          variants={bookControls}
          initial="initial"
          animate="animate"
        >
          <BookCover
            imageError={imageError}
            setImageError={setImageError}
            isDark={isDark}
            animationState={bookControls}
          />
        </motion.div>

        {/* Content Section */}
        <motion.div
          className="px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <BookContent isDark={isDark} />
        </motion.div>

        {/* Testimonial */}
        <motion.div
          className="px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Testimonial isDark={isDark} />
        </motion.div>
      </div>

      {/* Ambient Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: isDark
            ? [
                "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0) 50%)",
                "radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0) 50%)",
                "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0) 50%)",
              ]
            : [
                "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0) 50%)",
                "radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0) 50%)",
                "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0) 50%)",
              ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};
