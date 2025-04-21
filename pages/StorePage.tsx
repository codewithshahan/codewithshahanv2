import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, BookOpen, Check, Download, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const StorePage = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 0.5], [8, 0]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <div className="container mx-auto px-4 mb-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight text-gradient-primary">
                From Messy Code to Masterpiece
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                The ultimate guide to transform your chaotic codebase into
                elegant, maintainable software that stands the test of time.
                Perfect for developers at any level.
              </p>

              <div className="flex items-center mb-8">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="text-amber-500 fill-amber-500"
                    />
                  ))}
                </div>
                <span className="ml-2 text-muted-foreground">
                  4.9/5 (126 reviews)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="https://gumroad.com/cleancode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-md font-medium flex items-center justify-center hover:opacity-90 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>Buy Now - $29.99</span>
                  <ArrowRight size={16} className="ml-2" />
                </motion.a>

                <motion.a
                  href="#preview"
                  className="px-8 py-3 border border-primary/30 text-foreground rounded-md font-medium flex items-center justify-center hover:bg-primary/5 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <BookOpen size={16} className="mr-2" />
                  <span>Sample Preview</span>
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, rotateY: 30 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative mx-auto md:ml-auto"
              style={{ perspective: 1000 }}
            >
              <div className="relative w-64 h-80 md:w-80 md:h-96 mx-auto">
                <motion.div
                  className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary via-accent to-primary/80 rounded-lg shadow-[0_0_30px_rgba(147,51,234,0.5)]"
                  animate={{
                    rotateY: [0, 10, 0],
                    rotateX: [0, 5, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <div className="absolute inset-2 bg-black/80 rounded-lg flex flex-col items-center justify-center p-6 text-white text-center">
                    <h3 className="font-heading text-xl md:text-2xl mb-2">
                      FROM MESSY CODE
                    </h3>
                    <h3 className="font-heading text-xl md:text-2xl mb-6">
                      TO MASTERPIECE
                    </h3>
                    <div className="w-16 h-1 bg-primary mb-4"></div>
                    <p className="text-sm md:text-base">
                      A Comprehensive Guide to Clean Code Architecture
                    </p>
                    <div className="mt-auto">
                      <p className="text-sm">By CodeWithShahan</p>
                    </div>
                  </div>
                </motion.div>

                <div className="absolute -bottom-5 -right-5 w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-white text-center">
                    <div className="text-sm">Only</div>
                    <div className="text-xl font-bold">$29.99</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-primary/10 filter blur-xl"></div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gradient-to-b from-background to-background/80">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                What You'll Learn
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Level up your coding skills with practical techniques and
                examples that you can apply immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Clean Code Architecture",
                  icon: "📐",
                  description:
                    "Learn how to structure your code for maximum maintainability, scalability and developer happiness.",
                },
                {
                  title: "Refactoring Techniques",
                  icon: "🔄",
                  description:
                    "Master the art of transforming messy code into clean, elegant solutions without breaking functionality.",
                },
                {
                  title: "Design Patterns",
                  icon: "🧩",
                  description:
                    "Implement industry-standard design patterns to solve common programming challenges elegantly.",
                },
                {
                  title: "Test-Driven Development",
                  icon: "✅",
                  description:
                    "Write better code by learning how to build comprehensive tests that guide your development process.",
                },
                {
                  title: "Code Review Mastery",
                  icon: "👁️",
                  description:
                    "Become proficient at reviewing code and providing constructive feedback to improve team output.",
                },
                {
                  title: "Performance Optimization",
                  icon: "⚡",
                  description:
                    "Discover techniques to make your code not just clean, but blazing fast and resource-efficient.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-heading font-bold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div
          id="preview"
          ref={targetRef}
          className="py-20 bg-gradient-to-b from-background/80 to-background relative"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Book Preview
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Take a sneak peek at what's inside the book.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <motion.div
                className="glass-card overflow-hidden"
                style={{ opacity, y, scale, rotateZ: rotate }}
              >
                <div className="bg-secondary/50 p-3 flex justify-between items-center mb-4 border-b border-border">
                  <div className="font-mono text-sm">
                    Chapter 1: The Principles of Clean Code
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <h3>1.1 What Makes Code "Clean"?</h3>

                  <p>
                    Clean code isn't just about making your program work—it's
                    about making it work elegantly, efficiently, and in a way
                    that other developers (including your future self) can
                    easily understand and modify.
                  </p>

                  <p>
                    Robert C. Martin, commonly known as "Uncle Bob," defines
                    clean code as follows:
                  </p>

                  <blockquote>
                    <p>
                      "Clean code is code that has been taken care of. Someone
                      has taken the time to keep it simple and orderly. They
                      have paid appropriate attention to details. They have
                      cared."
                    </p>
                  </blockquote>

                  <h4>Key Characteristics of Clean Code:</h4>

                  <ul>
                    <li>
                      <strong>Readability:</strong> Code should be easy to read
                      and understand without excessive mental effort.
                    </li>
                    <li>
                      <strong>Simplicity:</strong> Code should be as simple as
                      possible, avoiding unnecessary complexity.
                    </li>
                    <li>
                      <strong>Maintainability:</strong> Code should be easy to
                      modify and extend without introducing bugs.
                    </li>
                    <li>
                      <strong>Testability:</strong> Code should be designed in a
                      way that makes it easy to test.
                    </li>
                  </ul>

                  <div className="bg-secondary/30 p-4 rounded-md font-mono text-sm">
                    <pre>
                      <code>{`// Bad example
function p(d) {
  var r = 0;
  for(var i = 0; i < d.length; i++) {
    r += d[i];
  }
  return r / d.length;
}

// Clean example
function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  
  const sum = numbers.reduce((total, number) => total + number, 0);
  return sum / numbers.length;
}`}</code>
                    </pre>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Want to read more? Get the full book now!
                  </p>
                  <motion.a
                    href="https://gumroad.com/cleancode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download size={16} className="mr-2" />
                    <span>Get Full Access</span>
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-20 bg-gradient-to-b from-background to-background/90">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                What Readers Say
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of developers who have transformed their coding
                skills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "This book completely changed how I approach coding. My pull requests now get approved in record time!",
                  author: "Sarah J.",
                  role: "Senior Frontend Developer",
                },
                {
                  quote:
                    "As a team lead, I've made this required reading for all new developers. It's that essential.",
                  author: "Michael T.",
                  role: "Engineering Manager",
                },
                {
                  quote:
                    "I wish I had this book when I started my career. It would have saved me years of writing spaghetti code.",
                  author: "Chen L.",
                  role: "Full Stack Developer",
                },
                {
                  quote:
                    "The practical examples and exercises make the concepts stick. This isn't just theory—it's immediately applicable.",
                  author: "Priya K.",
                  role: "Backend Engineer",
                },
                {
                  quote:
                    "Worth every penny. I reference this book constantly as I refactor our legacy codebase.",
                  author: "James W.",
                  role: "Software Architect",
                },
                {
                  quote:
                    "The section on test-driven development alone is worth the price of the book.",
                  author: "Ana R.",
                  role: "QA Engineer",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="glass-card h-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <div className="flex flex-col h-full">
                    <div className="text-2xl mb-4">❝</div>
                    <p className="mb-4 flex-grow">{testimonial.quote}</p>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-b from-background/90 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto glass-card border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                  Ready to Transform Your Code?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of developers who have already leveled up their
                  coding skills with "From Messy Code to Masterpiece."
                </p>

                <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
                  <div className="bg-secondary/50 rounded-lg p-4 text-center flex-1 max-w-xs">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      $29.99
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      One-time purchase
                    </p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4 text-center flex-1 max-w-xs">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Lifetime
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Free updates
                    </p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4 text-center flex-1 max-w-xs">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      100%
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Money-back guarantee
                    </p>
                  </div>
                </div>

                <ul className="mb-8 max-w-md mx-auto text-left">
                  {[
                    "Full 250+ page ebook (PDF, EPUB, MOBI)",
                    "Access to code examples and exercises",
                    "Bonus chapter: Advanced Patterns for React Apps",
                    "Email support for any questions",
                    "Free lifetime updates",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center mb-2">
                      <Check
                        size={18}
                        className="text-green-500 mr-2 flex-shrink-0"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <motion.a
                  href="https://gumroad.com/cleancode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-md font-medium hover:opacity-90 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>Get Your Copy Now</span>
                  <ArrowRight size={16} className="ml-2" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StorePage;
