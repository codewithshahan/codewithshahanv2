"use client";

import Link from "next/link";
import {
  GithubIcon,
  TwitterIcon,
  LinkedinIcon,
  RssIcon,
  Mail,
  Sparkles,
} from "lucide-react";
import { HOME, CATEGORY, SEARCH, STORE } from "@/lib/routes";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-30 mt-20 pb-12 pt-0 flex flex-col items-center justify-center min-h-[420px]">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="relative mx-auto max-w-3xl w-full rounded-[2.5rem] bg-background/80 shadow-2xl backdrop-blur-2xl px-6 py-12 md:px-16 md:py-16 flex flex-col items-center gap-10 border border-transparent before:content-[''] before:absolute before:inset-0 before:rounded-[2.5rem] before:pointer-events-none before:z-[-1] before:bg-gradient-to-r before:from-primary/30 before:via-accent/20 before:to-primary/30 before:animate-footerBorder">
          {/* Brand & Social */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tight mb-1 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-lg dark:from-primary dark:via-accent dark:to-primary dark:bg-clip-text dark:text-transparent dark:drop-shadow-lg text-shadow-lg">
              CodeWithShahan
            </span>
            <span className="text-base font-medium text-foreground mb-2">
              Premium resources for creative developers.
            </span>
            <div className="flex gap-3 mt-2">
              <a
                href="https://github.com/codewithshahan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 via-background/60 to-accent/10 border border-primary/10 text-foreground/70 hover:text-primary hover:scale-110 hover:shadow-xl transition-all duration-200"
              >
                <GithubIcon size={22} />
              </a>
              <a
                href="https://twitter.com/codewithshahan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 via-background/60 to-accent/10 border border-primary/10 text-foreground/70 hover:text-primary hover:scale-110 hover:shadow-xl transition-all duration-200"
              >
                <TwitterIcon size={22} />
              </a>
              <a
                href="https://linkedin.com/in/codewithshahan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 via-background/60 to-accent/10 border border-primary/10 text-foreground/70 hover:text-primary hover:scale-110 hover:shadow-xl transition-all duration-200"
              >
                <LinkedinIcon size={22} />
              </a>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RSS Feed"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 via-background/60 to-accent/10 border border-primary/10 text-foreground/70 hover:text-primary hover:scale-110 hover:shadow-xl transition-all duration-200"
              >
                <RssIcon size={22} />
              </a>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link
              href={HOME}
              className="text-base text-foreground/70 hover:text-primary font-semibold transition-colors px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Home
            </Link>
            <Link
              href={STORE}
              className="text-base text-foreground/70 hover:text-primary font-semibold transition-colors px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Resources
            </Link>
            <Link
              href={CATEGORY}
              className="text-base text-foreground/70 hover:text-primary font-semibold transition-colors px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Categories
            </Link>
            <Link
              href={SEARCH}
              className="text-base text-foreground/70 hover:text-primary font-semibold transition-colors px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Search
            </Link>
          </nav>
          {/* Subscribe */}
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-base text-foreground/60 mb-1">
              Get the latest updates, tips, and resources. No spam, ever.
            </span>
            <button className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30">
              <Mail className="w-5 h-5" />
              Subscribe
            </button>
            {/* Premium divider line */}
            <div className="w-full flex justify-center py-4">
              <div className="h-[2px] w-2/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full blur-[1px]" />
            </div>
          </div>
          <div className="w-full border-t border-border/30 pt-6 text-center text-muted-foreground text-sm">
            <p>© {currentYear} CodeWithShahan. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
