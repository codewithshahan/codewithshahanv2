"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  useScroll,
} from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Send,
  Code,
  Terminal,
  CheckCircle,
  AlertCircle,
  Phone,
  Calendar,
  Mail,
  Twitter,
  Github,
  ArrowRight,
  Clock,
  Linkedin,
  Check,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlassCard from "@/components/GlassCard";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Form schema with validation
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Floating particle component for premium background effect
const FloatingParticle = ({ size, x, y, delay, duration }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-primary/20 to-accent/20"
    style={{
      width: size,
      height: size,
      top: `${y}%`,
      left: `${x}%`,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.2, 1],
      y: [0, -20, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    }}
  />
);

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form
    if (!name || !email || !message) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Reset form
      setName("");
      setEmail("");
      setMessage("");
      setSubmitted(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="w-full max-w-3xl mx-auto mt-12 mb-20"
    >
      <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-gradient-slow"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>

        <div className="relative px-8 py-10 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-300">
            Let's Connect
          </h3>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mb-6"></div>

          <p className="text-gray-300 mb-8">
            I'd love to hear from you! Whether you have a question, project
            idea, or just want to say hello.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
            >
              {error}
            </motion.div>
          )}

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-green-500" />
              </motion.div>
              <h4 className="text-xl font-semibold text-green-500 mb-2">
                Message Sent!
              </h4>
              <p className="text-gray-300">
                Thank you for reaching out. I'll get back to you as soon as
                possible.
              </p>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Name
                </label>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg glass-input focus:ring-1 focus:ring-primary/30 focus:outline-none"
                    placeholder="Your name"
                  />
                </motion.div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email
                </label>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg glass-input focus:ring-1 focus:ring-primary/30 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </motion.div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Message
                </label>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <textarea
                    id="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg glass-input focus:ring-1 focus:ring-primary/30 focus:outline-none"
                    placeholder="Your message here..."
                  />
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    loading
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/20"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-200 rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Send Message
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </button>
              </motion.div>
            </motion.form>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const SocialMediaSection = () => {
  const socialLinks: SocialLink[] = [
    {
      name: "Twitter",
      url: "https://twitter.com/codewithshahan",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
      ),
      color: "bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20",
    },
    {
      name: "GitHub",
      url: "https://github.com/codewithshahan",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
      ),
      color:
        "bg-gray-800/10 text-gray-800 dark:text-gray-200 border-gray-800/20 dark:border-gray-200/20",
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/codewithshahan",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      ),
      color: "bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/codewithshahan",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      ),
      color: "bg-[#E4405F]/10 text-[#E4405F] border-[#E4405F]/20",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@codewithshahan",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </svg>
      ),
      color: "bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="mt-16 mb-24 w-full max-w-3xl mx-auto"
    >
      <div className="text-center mb-10">
        <motion.h2
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Connect With Me
        </motion.h2>
        <motion.div
          className="h-1 w-20 bg-gradient-to-r from-primary to-violet-500 mx-auto mt-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />
        <motion.p
          className="text-foreground/70 mt-4 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Follow me on social media for the latest updates, tutorials, and tech
          discussions.
        </motion.p>
      </div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="show"
      >
        {socialLinks.map((link, index) => (
          <motion.a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${link.color} hover:scale-105 hover:shadow-md`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="mb-2">{link.icon}</div>
            <span className="font-medium">{link.name}</span>
          </motion.a>
        ))}
      </motion.div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      content:
        "Working with Shahan transformed our product. His attention to detail and modern approach to UI design elevated our entire platform.",
      author: "Alex Johnson",
      position: "CTO, TechVision",
      avatar: "/avatars/testimonial-1.jpg",
    },
    {
      id: 2,
      content:
        "The code quality and architecture decisions were exceptional. Our development velocity improved significantly after implementing Shahan's recommendations.",
      author: "Sarah Chen",
      position: "Lead Developer, InnovateCorp",
      avatar: "/avatars/testimonial-2.jpg",
    },
    {
      id: 3,
      content:
        "Shahan's ability to translate complex requirements into elegant solutions is remarkable. The animations and micro-interactions added that premium touch we were looking for.",
      author: "Michael Rivera",
      position: "Product Manager, DesignMasters",
      avatar: "/avatars/testimonial-3.jpg",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="w-full max-w-5xl mx-auto mb-24 px-4"
    >
      <div className="text-center mb-12">
        <motion.h2
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          What Others Say
        </motion.h2>
        <motion.div
          className="h-1 w-20 bg-gradient-to-r from-primary to-violet-500 mx-auto mt-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            className="relative bg-background/30 backdrop-blur-md border border-border rounded-xl p-6 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 30px -15px rgba(var(--primary), 0.15)",
              borderColor: "rgba(var(--primary), 0.3)",
            }}
          >
            {/* Decorative quote mark */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-3 right-3 text-primary/10"
            >
              <path
                d="M10.762 4C5.076 7.139 2 11.114 2 16.53c0 3.819 2.127 7.243 6.38 7.243 3.519 0 6.083-2.608 6.083-6.111 0-3.314-2.392-5.73-5.645-5.73-.544 0-1.079.092-1.426.275.639-2.516 3.038-5.73 7.278-7.886L10.762 4zm15.925 0c-5.686 3.139-8.762 7.114-8.762 12.53 0 3.819 2.127 7.243 6.38 7.243 3.519 0 6.083-2.608 6.083-6.111 0-3.314-2.392-5.73-5.645-5.73-.544 0-1.079.092-1.426.275.639-2.516 3.038-5.73 7.278-7.886L26.687 4z"
                fill="currentColor"
              />
            </svg>

            {/* Testimonial content */}
            <div className="mb-6 text-foreground/80 italic">
              "{testimonial.content}"
            </div>

            {/* Author info */}
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {testimonial.avatar ? (
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-primary">
                    {testimonial.author.charAt(0)}
                  </span>
                )}
              </div>
              <div className="ml-3">
                <p className="font-medium text-foreground">
                  {testimonial.author}
                </p>
                <p className="text-sm text-foreground/60">
                  {testimonial.position}
                </p>
              </div>
            </div>

            {/* Decorative gradient */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How can I collaborate with you on a project?",
      answer:
        "You can reach out through the contact form above or connect with me on LinkedIn. I'm always open to discussing new project ideas, tech collaborations, or mentorship opportunities.",
    },
    {
      question: "Do you offer consulting services?",
      answer:
        "Yes, I provide consulting services for web and mobile application development, UI/UX design, and technical architecture. My approach focuses on creating clean, efficient, and scalable solutions.",
    },
    {
      question: "What technologies do you specialize in?",
      answer:
        "I specialize in modern web technologies including React, Next.js, TypeScript, and Node.js. I'm also experienced with UI libraries like Tailwind CSS, Framer Motion for animations, and various backend technologies.",
    },
    {
      question: "How long does it usually take to get a response?",
      answer:
        "I typically respond to all inquiries within 24-48 hours. For urgent matters, please mention it in your message and I'll prioritize accordingly.",
    },
    {
      question: "Can I feature your content on my platform?",
      answer:
        "I'm open to content collaborations and features. Please reach out with specific details about your platform and the type of content you're interested in featuring.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="w-full max-w-3xl mx-auto mb-24 px-4"
    >
      <div className="text-center mb-10">
        <motion.h2
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.div
          className="h-1 w-20 bg-gradient-to-r from-primary to-violet-500 mx-auto mt-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        />
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className="border border-border rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
          >
            <motion.button
              className="w-full p-4 flex justify-between items-center text-left font-medium focus:outline-none bg-background/50 backdrop-blur-sm"
              onClick={() => toggleFAQ(index)}
              whileHover={{ backgroundColor: "rgba(var(--primary), 0.05)" }}
              whileTap={{ scale: 0.99 }}
            >
              <span>{faq.question}</span>
              <motion.div
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 ml-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary"
                >
                  <path
                    d="M19 9L12 16L5 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-background/30 backdrop-blur-sm border-t border-border">
                    <p className="text-foreground/80">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <p className="text-foreground/70">
          Didn't find an answer to your question?{" "}
          <a href="#contact-form" className="text-primary hover:underline">
            Ask me directly
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
};

const CallToActionSection = () => {
  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
      viewport={{ once: true, margin: "-100px" }}
      className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm rounded-3xl max-w-7xl mx-auto my-16"
    >
      <div className="max-w-4xl mx-auto text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 mb-6"
        >
          Ready to Start Your Next Project?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          viewport={{ once: true }}
          className="text-gray-300 text-lg md:text-xl"
        >
          I offer custom software solutions, UX design, and technical consulting
          to bring your ideas to life
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <ul className="space-y-4">
            {[
              "Clean, modern code with best practices",
              "Responsive and accessible design",
              "Performance optimized applications",
              "Ongoing support and maintenance",
            ].map((item, i) => (
              <motion.li
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={listItemVariants}
                className="flex items-start gap-3"
              >
                <CheckCircle className="h-6 w-6 text-sky-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-200">{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.3,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 backdrop-blur-md p-8 rounded-2xl border border-slate-700/50 shadow-xl"
        >
          <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">
            Let's Discuss Your Vision
          </h3>
          <p className="text-gray-300 mb-6">
            Share your project ideas and requirements, and I'll help you
            transform them into reality with the right technologies and
            approach.
          </p>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="#contact-form"
              className="inline-block bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
            >
              Start a Conversation
            </Link>
          </motion.div>
          <p className="text-gray-400 text-sm mt-4">
            No obligations, just a friendly discussion
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default function ReachMe() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isPhoneShown, setIsPhoneShown] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();
  const { scrollY } = useScroll();
  const [parallaxY, setParallaxY] = useState(0);

  // Form state with direct values instead of using complex validation
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Simple form change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    // Clear error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Simple validation
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };

    if (!formValues.name || formValues.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      valid = false;
    }

    if (!formValues.email || !/^\S+@\S+\.\S+$/.test(formValues.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (!formValues.subject || formValues.subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
      valid = false;
    }

    if (!formValues.message || formValues.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Send email using our API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      console.log("Form data:", formValues);
      setSubmitStatus("success");

      // Reset form
      setFormValues({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Reset success state after delay
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 3000);

      // Show phone number after successful submission
      setIsPhoneShown(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parallax effect for decorative elements
  useEffect(() => {
    const unsubscribe = scrollY.onChange((y) => {
      setParallaxY(y * 0.2);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Toggle phone visibility with animation and focus on name field
  const togglePhone = () => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        {/* Decorative elements - Apple-style floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                scale: Math.random() * 0.5 + 0.5,
                translateY: parallaxY * (Math.random() * 0.5 + 0.5),
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Apple-style grid lines */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <div
            className="h-px w-full bg-foreground"
            style={{ top: "25%", position: "absolute" }}
          ></div>
          <div
            className="h-px w-full bg-foreground"
            style={{ top: "50%", position: "absolute" }}
          ></div>
          <div
            className="h-px w-full bg-foreground"
            style={{ top: "75%", position: "absolute" }}
          ></div>
          <div
            className="w-px h-full bg-foreground"
            style={{ left: "25%", position: "absolute" }}
          ></div>
          <div
            className="w-px h-full bg-foreground"
            style={{ left: "50%", position: "absolute" }}
          ></div>
          <div
            className="w-px h-full bg-foreground"
            style={{ left: "75%", position: "absolute" }}
          ></div>
        </div>

        <Navbar />

        <main className="flex-grow pt-24 pb-16 relative z-10">
          <div className="container px-4 mx-auto max-w-4xl">
            {/* Premium header with 3D effect */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative inline-block mb-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl opacity-70"
                />
                <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gradient-primary">
                  Reach Me
                </h1>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-2"
                />
              </div>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Have a question, project idea, or just want to say hello? Drop
                me a message!
              </p>

              {/* Floating particles for premium look */}
              <div className="relative h-20 w-full mt-6">
                {[...Array(6)].map((_, i) => (
                  <FloatingParticle
                    key={i}
                    size={Math.random() * 40 + 20}
                    x={Math.random() * 100}
                    y={50}
                    delay={i * 0.2}
                    duration={3 + Math.random() * 2}
                  />
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
              {/* Contact Form Section - with Apple-style design */}
              <motion.div
                className="md:col-span-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <GlassCard
                  className="border border-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 backdrop-blur-xl relative overflow-hidden"
                  isInput={true}
                >
                  {/* Premium gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-40 pointer-events-none" />

                  {/* Animated light effect */}
                  <motion.div
                    className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-70 pointer-events-none"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />

                  <motion.div
                    className="absolute -left-20 -bottom-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl opacity-70 pointer-events-none"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                      duration: 5,
                      delay: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />

                  <div className="flex items-center justify-between mb-6 relative z-20">
                    <div className="flex items-center">
                      <div className="mr-3 p-2 bg-primary/10 rounded-lg">
                        <Terminal className="text-primary" size={20} />
                      </div>
                      <h2 className="text-xl font-heading">message.send()</h2>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/30"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/30"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/30"></div>
                    </div>
                  </div>

                  <form
                    ref={formRef}
                    onSubmit={handleFormSubmit}
                    id="contact-form"
                    className="space-y-6 relative z-50"
                  >
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="contactName"
                        className="block text-sm font-medium mb-2 font-mono flex items-center group"
                      >
                        <span className="bg-primary/10 p-1 rounded mr-2 group-hover:bg-primary/20 transition-colors">
                          <Code size={14} className="text-primary" />
                        </span>
                        <span className="text-primary">const</span> name{" "}
                        <span className="text-primary">=</span>
                      </label>
                      <input
                        id="contactName"
                        type="text"
                        name="name"
                        ref={nameInputRef}
                        value={formValues.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 glass border-primary/20 focus:border-primary/50 rounded-md transition-all duration-300 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 outline-none relative z-50 backdrop-blur-sm shadow-sm"
                        placeholder="Your Name"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-xs text-red-500 flex items-center">
                          <AlertCircle size={12} className="mr-1" />{" "}
                          {formErrors.name}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label
                        className="block text-sm font-medium mb-2 font-mono flex items-center group"
                        htmlFor="email"
                      >
                        <span className="bg-primary/10 p-1 rounded mr-2 group-hover:bg-primary/20 transition-colors">
                          <Code size={14} className="text-primary" />
                        </span>
                        <span className="text-primary">const</span> email{" "}
                        <span className="text-primary">=</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full px-4 py-3 glass border-primary/20 focus:border-primary/50 rounded-md transition-all duration-300 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 outline-none relative z-50 backdrop-blur-sm shadow-sm"
                        placeholder="your.email@example.com"
                        name="email"
                        value={formValues.email}
                        onChange={handleInputChange}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500 flex items-center">
                          <AlertCircle size={12} className="mr-1" />{" "}
                          {formErrors.email}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label
                        className="block text-sm font-medium mb-2 font-mono flex items-center group"
                        htmlFor="subject"
                      >
                        <span className="bg-primary/10 p-1 rounded mr-2 group-hover:bg-primary/20 transition-colors">
                          <Code size={14} className="text-primary" />
                        </span>
                        <span className="text-primary">const</span> subject{" "}
                        <span className="text-primary">=</span>
                      </label>
                      <input
                        id="subject"
                        className="w-full px-4 py-3 glass border-primary/20 focus:border-primary/50 rounded-md transition-all duration-300 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 outline-none relative z-50 backdrop-blur-sm shadow-sm"
                        placeholder="Subject"
                        name="subject"
                        value={formValues.subject}
                        onChange={handleInputChange}
                      />
                      {formErrors.subject && (
                        <p className="mt-1 text-xs text-red-500 flex items-center">
                          <AlertCircle size={12} className="mr-1" />{" "}
                          {formErrors.subject}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label
                        className="block text-sm font-medium mb-2 font-mono flex items-center group"
                        htmlFor="message"
                      >
                        <span className="bg-primary/10 p-1 rounded mr-2 group-hover:bg-primary/20 transition-colors">
                          <Code size={14} className="text-primary" />
                        </span>
                        <span className="text-primary">const</span> message{" "}
                        <span className="text-primary">=</span>
                      </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          name="message"
                          value={formValues.message}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 glass border-primary/20 focus:border-primary/50 rounded-md min-h-[150px] resize-none transition-all duration-300 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 outline-none relative z-50 backdrop-blur-sm shadow-sm"
                          placeholder="Hello! I'd like to discuss..."
                          style={{ isolation: "isolate" }}
                          data-gramm="true"
                          data-gramm_editor="true"
                          data-enable-grammarly="true"
                        />
                        {/* Character count */}
                        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-full">
                          {formValues.message.length} chars
                        </div>
                      </div>
                      {formErrors.message && (
                        <p className="mt-1 text-xs text-red-500 flex items-center">
                          <AlertCircle size={12} className="mr-1" />{" "}
                          {formErrors.message}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] text-white py-3 px-4 rounded-md font-medium relative group overflow-hidden"
                        disabled={isSubmitting}
                      >
                        {/* Button glow effect */}
                        <div className="absolute inset-0 w-full h-full glow opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <AnimatePresence mode="wait">
                          {isSubmitting ? (
                            <motion.div
                              key="submitting"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center"
                            >
                              <svg
                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </motion.div>
                          ) : submitStatus === "success" ? (
                            <motion.div
                              key="success"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center"
                            >
                              <CheckCircle className="mr-2" size={18} />
                              Sent Successfully
                            </motion.div>
                          ) : submitStatus === "error" ? (
                            <motion.div
                              key="error"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center"
                            >
                              <AlertCircle className="mr-2" size={18} />
                              Error sending message
                            </motion.div>
                          ) : (
                            <motion.div
                              key="send"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center"
                            >
                              <Send className="mr-2" size={18} />
                              Send Message
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </motion.div>
                  </form>

                  <AnimatePresence>
                    {submitStatus === "success" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, scale: [1, 1.02, 1] }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.4, scale: { duration: 0.6 } }}
                        className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md flex items-center text-green-500"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: [0, 15, 0] }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                        </motion.div>
                        <span>
                          Message sent successfully! I'll get back to you soon.
                        </span>
                      </motion.div>
                    )}

                    {submitStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md flex items-center text-red-500"
                      >
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>
                          Something went wrong. Please try again or contact me
                          directly via email.
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>

              {/* Connect With Me Section - with enhanced Apple-style design */}
              <motion.div
                className="md:col-span-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="space-y-6">
                  <GlassCard
                    className="h-full"
                    mobileResponsive={true}
                    variant="default"
                    isInput={false}
                  >
                    <h3 className="text-xl font-heading mb-6 relative z-20">
                      Connect With Me
                    </h3>

                    <div className="space-y-5 relative z-20">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:bg-primary/30">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Email</h4>
                          <a
                            href="mailto:codewithshahan@gmail.com"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            codewithshahan@gmail.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:bg-primary/30">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Phone</h4>
                          {isPhoneShown ? (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                y: 0,
                                transition: {
                                  height: { duration: 0.3 },
                                  opacity: { duration: 0.5, delay: 0.1 },
                                },
                              }}
                              className="overflow-hidden"
                            >
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: 1,
                                  transition: { delay: 0.2 },
                                }}
                                className="flex items-center"
                              >
                                <span className="text-sm text-primary font-mono bg-primary/10 px-2 py-1 rounded">
                                  +8801610660715
                                </span>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.3 }}
                                  className="ml-2 bg-green-500/20 p-1 rounded-full"
                                >
                                  <CheckCircle
                                    size={12}
                                    className="text-green-500"
                                  />
                                </motion.div>
                              </motion.div>
                            </motion.div>
                          ) : (
                            <button
                              onClick={togglePhone}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                            >
                              <span className="mr-1">
                                Available after form submission
                              </span>
                              <ArrowRight
                                size={12}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:bg-primary/30">
                          <Linkedin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">LinkedIn</h4>
                          <a
                            href="https://linkedin.com/in/codewithshahan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            codewithshahan
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:bg-primary/30">
                          <Twitter className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Twitter</h4>
                          <a
                            href="https://twitter.com/shahancd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            @shahancd
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:bg-primary/30">
                          <Github className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">GitHub</h4>
                          <a
                            href="https://github.com/codewithshahan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            codewithshahan
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border relative z-20">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-center mb-3">
                          <Calendar className="w-5 h-5 mr-2 text-primary" />
                          <h4 className="text-sm font-medium">Book a Call</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Schedule a call to discuss your project requirements
                          or any questions you might have.
                        </p>
                        <Link
                          href="https://calendly.com/codewithshahan"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-sm inline-flex items-center justify-center px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-all duration-300 hover:shadow-md group"
                        >
                          <span>Schedule Meeting</span>
                          <ArrowRight
                            size={14}
                            className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </Link>
                      </motion.div>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            </div>

            {/* Apple-style features highlight */}
            <motion.div
              className="mt-12 glass-card p-8 text-center border border-primary/20 relative overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Improved background effect with color adaptation for dark/light mode */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10 opacity-50" />

              {/* Enhanced shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  repeat: 1,
                  duration: 2.5,
                  ease: "easeInOut",
                  repeatDelay: 7,
                }}
              />

              {/* Accent orbs/bubbles that float around - different colors for dark/light mode */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 blur-xl"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: 0.4,
                    }}
                    animate={{
                      x: [0, Math.random() * 40 - 20],
                      y: [0, Math.random() * 40 - 20],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 10 + Math.random() * 10,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </div>

              {/* Glass overlay for better text legibility */}
              <div className="absolute inset-0 backdrop-blur-[1px] bg-background/5" />

              <h2 className="text-2xl font-bold mb-6 relative z-20">
                Working with me
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
                <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 dark:group-hover:shadow-primary/40">
                    <Code className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                    Expert Development
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Specialized in modern web development with scalable,
                    maintainable solutions.
                  </p>
                </div>

                <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 dark:group-hover:shadow-primary/40">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Clock className="w-7 h-7 text-primary" />
                    </motion.div>
                  </div>
                  <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                    Fast Response
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quick communication and timely project updates for seamless
                    collaboration.
                  </p>
                </div>

                <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 dark:group-hover:shadow-primary/40">
                    <Calendar className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                    Flexible Scheduling
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Book appointments that work with your timezone and
                    availability.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Social Media Section */}
            <SocialMediaSection />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* FAQ Section */}
            <FAQSection />

            {/* Call to Action Section */}
            <CallToActionSection />
          </div>
        </main>

        <Footer />

        {/* Footer/Alternative Contact Section */}
        <motion.section
          className="py-16 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              >
                <h3 className="text-2xl font-semibold mb-2 tracking-tight">
                  Connect Elsewhere
                </h3>
                <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-4"></div>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You can also reach me through these platforms for
                  collaboration or just to say hello
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  className="rounded-xl p-5 glass backdrop-blur-md border border-border hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center text-center">
                    <Twitter className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-medium mb-1">Twitter / X</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Quick updates & coding tips
                    </p>
                    <a
                      href="https://twitter.com/codewithshahan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      @codewithshahan
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-xl p-5 glass backdrop-blur-md border border-border hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center text-center">
                    <Linkedin className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-medium mb-1">LinkedIn</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Professional inquiries
                    </p>
                    <a
                      href="https://linkedin.com/in/codewithshahan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      /in/codewithshahan
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-xl p-5 glass backdrop-blur-md border border-border hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.7, duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center text-center">
                    <Mail className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-medium mb-1">Email</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Direct correspondence
                    </p>
                    <a
                      href="mailto:contact@codewithshahan.com"
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      contact@codewithshahan.com
                    </a>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="mt-16 text-center text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.5 }}
              >
                <p>
                  © {new Date().getFullYear()} Code with Shahan. All rights
                  reserved.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tr from-primary/20 to-accent/5 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-accent/20 to-primary/5 rounded-full blur-3xl opacity-50"></div>
        </motion.section>
      </div>
    </Providers>
  );
}
