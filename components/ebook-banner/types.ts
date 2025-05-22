import { ReactNode } from "react";

export interface BookCoverProps {
  imageError: boolean;
  setImageError: (error: boolean) => void;
  isDark: boolean;
  animationState: string;
}

export interface TestimonialProps {
  isDark: boolean;
}

export interface MiniCardProps {
  isDark: boolean;
  handleExpandMiniCard: () => void;
  miniCardVisible: boolean;
}

export interface WindowControlsProps {
  isDark: boolean;
  onClose: () => void;
}

export interface BookStatsProps {
  isDark: boolean;
}

export interface BookFeaturesProps {
  isDark: boolean;
}

export interface BookActionsProps {
  isDark: boolean;
}

export interface BookContentProps {
  isDark: boolean;
}

export interface MobileLayoutProps {
  isDark: boolean;
  bookControls: any;
  containerControls: any;
  imageError: boolean;
  setImageError: (error: boolean) => void;
}

export interface DesktopLayoutProps {
  isDark: boolean;
  bookControls: any;
  containerControls: any;
  imageError: boolean;
  setImageError: (error: boolean) => void;
}
