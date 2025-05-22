"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { motion } from "framer-motion";

// Button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles applied to all buttons
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium:
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-glow-sm hover:shadow-glow transition-all duration-300",
        glass:
          "bg-white/10 backdrop-blur-md text-foreground border border-white/20 shadow-sm hover:bg-white/20 transition-all duration-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-base",
        xl: "h-12 rounded-md px-10 text-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Extended props interface
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  asChild?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

// Animation variants
const buttonAnimationVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.03 },
  tap: { scale: 0.97 },
};

const glowVariants = {
  rest: { opacity: 0.5 },
  hover: { opacity: 0.8, transition: { duration: 0.3 } },
};

// Button component
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={buttonAnimationVariants}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg
              className="h-5 w-5 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}

        {/* Premium glow effect for premium variant */}
        {variant === "premium" && (
          <motion.span
            className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50 blur-md"
            variants={glowVariants}
            initial="rest"
            animate="rest"
            whileHover="hover"
          />
        )}

        {/* Button content with opacity control for loading state */}
        <span
          className={cn("flex items-center gap-2", {
            "opacity-0": isLoading,
            "opacity-100": !isLoading,
          })}
        >
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
