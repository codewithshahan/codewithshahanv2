import { motion } from "framer-motion";
import { WindowControlsProps } from "./types";

export const WindowControls = ({ isDark, onClose }: WindowControlsProps) => {
  return (
    <div className="relative h-10 px-4 flex items-center border-b dark:border-[#3a3a3c] light:border-[#e0e0e0]">
      <div className="flex items-center gap-2">
        <motion.div
          className="w-3 h-3 rounded-full bg-[#ff5f57] flex items-center justify-center"
          whileHover={{ scale: 1.2 }}
          onClick={onClose}
          role="button"
          aria-label="Close"
        >
          <div className="opacity-0 group-hover:opacity-100 text-[8px] text-[#7d0000]">
            ✕
          </div>
        </motion.div>
        <motion.div
          className="w-3 h-3 rounded-full bg-[#febc2e]"
          whileHover={{ scale: 1.2 }}
          role="button"
          aria-label="Minimize"
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-[#28c840]"
          whileHover={{ scale: 1.2 }}
          role="button"
          aria-label="Expand"
        />
      </div>

      <div
        className={`absolute left-1/2 -translate-x-1/2 text-xs font-medium ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Clean Code Zero to One — Ebook
      </div>
    </div>
  );
};
