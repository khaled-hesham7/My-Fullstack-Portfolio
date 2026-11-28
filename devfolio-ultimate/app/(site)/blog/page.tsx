import React from "react";
import BlogsClientPage from "./BlogsClientPage";
import { generateSEO } from "@/utils/seo";
import { getApiBaseUrl } from "@/lib/utils";

const blogPageUrl = "https://khaled-the-forge.vercel.app/blog";
const blogPageTitle = "Blog Posts | Khaled Hesham | The Forge";
const blogPageDescription =
  "Read the latest blog posts about web development, React, Next.js, and software engineering tips.";
const blogPageImage = "https://khaled-the-forge.vercel.app/khalid.jpeg";

export const metadata = generateSEO({
  title: blogPageTitle,
  description: blogPageDescription,
  url: blogPageUrl,
  image: blogPageImage,
  type: "article", 
  keywords: [
    "Khaled Hesham",
    "blog",
    "web development",
    "React",
    "Next.js",
    "software engineering",
    "JavaScript",
    "Backend tips",
    "programming blogs",
  ],
});

export default async function Blog() {
  let articles = [];
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/articles?per_page=12&category=technical`, { cache: "no-store" });
    if (res.ok) {
      const payload = await res.json();
      if (payload.success && payload.data) {
        articles = payload.data.data || [];
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to fetch articles:", error);
    }
  }

  return <BlogsClientPage articles={articles} />;
}
