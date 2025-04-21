import { performance } from "@/lib/performance";
import { optimize } from "@/lib/performance";

// Define email configuration variables
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailTo = process.env.EMAIL_TO;
const newsletterEmail = process.env.NEWSLETTER_EMAIL;

export interface EmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterData {
  email: string;
  name?: string;
}

// Mock implementation for browser environment
export const emailService = {
  // Send contact form email
  sendEmail: async (data: EmailData) => {
    try {
      // In a real application, this would call an API endpoint
      console.log("Email would be sent with data:", data);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  // Subscribe to newsletter
  subscribeToNewsletter: async (data: NewsletterData) => {
    try {
      // In a real application, this would call an API endpoint
      console.log("Newsletter subscription with data:", data);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true };
    } catch (error) {
      console.error("Error processing newsletter subscription:", error);
      throw error;
    }
  },

  // Validate email format
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Format email data
  formatEmailData: (data: EmailData): EmailData => {
    return {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
    };
  },
};
