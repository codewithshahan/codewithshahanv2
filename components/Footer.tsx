"use client";

import Link from "next/link";
import { GithubIcon, TwitterIcon, LinkedinIcon, RssIcon } from "lucide-react";
import { HOME, CATEGORY, SEARCH, STORE } from "@/lib/routes";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-12 mt-20 relative z-10 bg-background">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CodeWithShahan</h3>
            <p className="text-muted-foreground mb-4">
              A blog about web development, programming, and technology.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/codewithshahan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon size={20} />
              </a>
              <a
                href="https://twitter.com/codewithshahan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon size={20} />
              </a>
              <a
                href="https://linkedin.com/in/codewithshahan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={20} />
              </a>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground transition-colors"
                aria-label="RSS Feed"
              >
                <RssIcon size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={HOME}
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={STORE}
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href={CATEGORY}
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href={SEARCH}
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Subscribe</h3>
            <p className="text-muted-foreground mb-4">
              Stay updated with the latest articles and news.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-md bg-secondary text-foreground outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-muted-foreground">
          <p>© {currentYear} CodeWithShahan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
