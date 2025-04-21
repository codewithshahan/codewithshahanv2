import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, Code, Terminal, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { emailService, EmailData } from "@/services/emailService";
import { performance } from "@/lib/performance";
import { optimize } from "@/lib/performance";

// Form schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  // Debounced form submission
  const debouncedSubmit = optimize.debounce(async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Format and validate email data
      const formattedData: EmailData = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      };

      if (!emailService.validateEmail(formattedData.email)) {
        throw new Error("Invalid email format");
      }

      // Send the email
      await emailService.sendEmail(formattedData);

      setSubmitStatus("success");
      toast({
        title: "Message sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      reset();

      // Reset success state after 3 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, 300);

  const onSubmit = (data: ContactFormData) => {
    debouncedSubmit(data);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const glitchVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container px-4 mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 text-gradient-primary">
              Reach Me
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question, project idea, or just want to say hello? Drop me
              a message!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <motion.div
              className="md:col-span-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="glass-card border border-primary/20"
                variants={itemVariants}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Terminal className="text-primary mr-2" size={20} />
                    <h2 className="text-xl font-heading">message.send()</h2>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                  >
                    <motion.div variants={itemVariants}>
                      <label
                        className="block text-sm font-medium mb-1 font-mono"
                        htmlFor="name"
                      >
                        <Code size={16} className="inline mr-1" />
                        <span className="text-primary">const</span> name{" "}
                        <span className="text-primary">=</span>
                      </label>
                      <Input
                        id="name"
                        placeholder="Your Name"
                        className="glass border-primary/20 focus:border-primary/50"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label
                        className="block text-sm font-medium mb-1 font-mono"
                        htmlFor="email"
                      >
                        <Code size={16} className="inline mr-1" />
                        <span className="text-primary">const</span> email{" "}
                        <span className="text-primary">=</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="glass border-primary/20 focus:border-primary/50"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label
                        className="block text-sm font-medium mb-1 font-mono"
                        htmlFor="subject"
                      >
                        <Code size={16} className="inline mr-1" />
                        <span className="text-primary">const</span> subject{" "}
                        <span className="text-primary">=</span>
                      </label>
                      <Input
                        id="subject"
                        placeholder="Subject"
                        className="glass border-primary/20 focus:border-primary/50"
                        {...register("subject")}
                      />
                      {errors.subject && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.subject.message}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label
                        className="block text-sm font-medium mb-1 font-mono"
                        htmlFor="message"
                      >
                        <Code size={16} className="inline mr-1" />
                        <span className="text-primary">const</span> message{" "}
                        <span className="text-primary">=</span>
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Hello! I'd like to discuss..."
                        className="glass border-primary/20 focus:border-primary/50 min-h-[150px]"
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.message.message}
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                        disabled={isSubmitting}
                      >
                        <AnimatePresence mode="wait">
                          {isSubmitting ? (
                            <motion.div
                              key="submitting"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                              className="flex items-center"
                            >
                              <CheckCircle className="mr-2" size={16} />
                              Sent Successfully
                            </motion.div>
                          ) : submitStatus === "error" ? (
                            <motion.div
                              key="error"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              <AlertCircle className="mr-2" size={16} />
                              Error sending message
                            </motion.div>
                          ) : (
                            <motion.div
                              key="send"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              <Send className="mr-2" size={16} />
                              Send Message
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>

            <motion.div
              className="md:col-span-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="glass-card h-full" variants={itemVariants}>
                <h3 className="text-xl font-heading mb-6">Connect With Me</h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-primary"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
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
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-primary"
                      >
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Twitter</h4>
                      <a
                        href="https://twitter.com/codewithshahan"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        @codewithshahan
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-primary"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
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
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-primary"
                      >
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
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

                <div className="mt-8 pt-8 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Office Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 9:00 AM - 5:00 PM GMT
                    <br />
                    Response time: within 24-48 hours
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
