import React from "react";
import ContactClientPage from "./ContactClientPage";
import { generateSEO } from "@/utils/seo"; // اتأكد من المسار الصحيح

const contactPageUrl = "https://khaled-the-forge.vercel.app/contact";
const contactPageTitle =
  "Contact | Khaled Hesham | Backend Developer | The Forge";
const contactPageDescription =
  "Get in touch with Khaled Hesham for collaborations, projects, or inquiries. Let's build something great together!";
const contactPageImage = "https://khaled-the-forge.vercel.app/khalid.jpeg";

export const metadata = generateSEO({
  title: contactPageTitle,
  description: contactPageDescription,
  url: contactPageUrl,
  image: contactPageImage,
  type: "website",
  keywords: [
    "Khaled Hesham",
    "contact",
    "Backend developer",
    "React",
    "Next.js",
    "collaboration",
    "freelance",
    "portfolio",
  ],
});

const Contact = () => {
  return <ContactClientPage />;
};

export default Contact;
