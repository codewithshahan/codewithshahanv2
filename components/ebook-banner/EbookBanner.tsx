import { useState } from "react";
import { useMediaQuery } from "./hooks/use-media-query";
import { MobileLayout } from "./MobileLayout";
import { DesktopLayout } from "./DesktopLayout";

export const EbookBanner = () => {
  const [imageError, setImageError] = useState(false);
  const isDark = true; // You can make this dynamic based on your theme system
  const isMobile = useMediaQuery("(max-width: 1024px)");

  // Animation variants
  const bookControls = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const containerControls = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden py-12 px-4">
      {isMobile ? (
        <MobileLayout
          isDark={isDark}
          bookControls={bookControls}
          containerControls={containerControls}
          imageError={imageError}
          setImageError={setImageError}
        />
      ) : (
        <DesktopLayout
          isDark={isDark}
          bookControls={bookControls}
          containerControls={containerControls}
          imageError={imageError}
          setImageError={setImageError}
        />
      )}
    </div>
  );
};
