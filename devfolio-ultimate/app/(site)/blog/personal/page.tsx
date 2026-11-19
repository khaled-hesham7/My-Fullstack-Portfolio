import React from "react";
import BlogsClientPage from "../BlogsClientPage";
import { generateSEO } from "@/utils/seo";
import { getApiBaseUrl } from "@/lib/utils";

const personalPageUrl = "https://the-forge-one.vercel.app/blog/personal";
const personalPageTitle = "Personal Notes & Reflections | Khaled Hesham";
const personalPageDescription =
  "Personal journey, life thoughts, learnings, and experiences beyond code by Khaled Hesham.";
const personalPageImage = "https://the-forge-one.vercel.app/khalid.jpeg";

export const metadata = generateSEO({
  title: personalPageTitle,
  description: personalPageDescription,
  url: personalPageUrl,
  image: personalPageImage,
  type: "article",
  keywords: [
    "Khaled Hesham",
    "personal blog",
    "journey",
    "thoughts",
    "reflections",
    "life lessons",
    "career stories",
  ],
});

export default async function PersonalBlog() {
  let articles = [];
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(
      `${apiBase}/articles?per_page=12&category=personal`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const payload = await res.json();
      if (payload.success && payload.data) {
        articles = payload.data.data || [];
      }
    }
  } catch (error) {
    console.error("Failed to fetch personal articles:", error);
  }

  return <BlogsClientPage articles={articles} category="personal" />;
}
