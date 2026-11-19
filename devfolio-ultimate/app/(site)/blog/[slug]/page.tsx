import { notFound } from "next/navigation";
import { generateSEO } from "@/utils/seo";
import { getApiBaseUrl } from "@/lib/utils";
import type { Metadata } from "next";
import SingleBlogClient from "./SingleBlogClient";

async function fetchBlogPost(slugOrId: string) {
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/articles/${slugOrId}`, { cache: "no-store" });
    if (res.ok) {
      const payload = await res.json();
      if (payload.success && payload.data) {
        return payload.data;
      }
    }
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }
  return null;
}

function mapBackendBlocksToFrontend(backendContent: any[]): any[] {
  if (!backendContent || !Array.isArray(backendContent)) return [];

  const frontendBlocks: any[] = [];
  backendContent.forEach((block, idx) => {
    if (block.title) {
      frontendBlocks.push({
        id: `heading-${block.id}-${idx}`,
        type: "heading",
        content: block.title,
      });
    }
    if (block.text) {
      frontendBlocks.push({
        id: `text-${block.id}-${idx}`,
        type: "text",
        content: block.text,
      });
    }
    if (block.code) {
      frontendBlocks.push({
        id: `code-${block.id}-${idx}`,
        type: "code",
        content: block.code,
        language: "javascript",
      });
    }
    if (block.images && Array.isArray(block.images)) {
      block.images.forEach((imgUrl: string, imgIdx: number) => {
        frontendBlocks.push({
          id: `image-${block.id}-${idx}-${imgIdx}`,
          type: "image",
          url: imgUrl,
          caption: "",
        });
      });
    }
    if (block.videos && Array.isArray(block.videos)) {
      block.videos.forEach((vidUrl: string, vidIdx: number) => {
        frontendBlocks.push({
          id: `video-${block.id}-${idx}-${vidIdx}`,
          type: "external-video",
          url: vidUrl,
          caption: "",
        });
      });
    }
  });

  return frontendBlocks;
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params;
  const blogPost = await fetchBlogPost(slug);
  if (!blogPost) notFound();

  const url = `https://the-forge-one.vercel.app/blog/${slug}`;
  return generateSEO({
    title: `${blogPost.title} | Khaled Hesham | The Forge`,
    description: blogPost.excerpt,
    url,
    type: "article",
  });
}

export default async function SingleBlogPage({ params }: any) {
  const { slug } = await params;
  const blogPost = await fetchBlogPost(slug);
  if (!blogPost) notFound();

  const mappedPost = {
    title: blogPost.title,
    excerpt: blogPost.excerpt,
    date: blogPost.date?.raw ? new Date(blogPost.date.raw).toLocaleDateString() : new Date().toLocaleDateString(),
    readTime: "5 min read",
    banner: {
      url: blogPost.feature_image || "/images/placeholder.jpg",
      type: "image",
      caption: blogPost.title,
    },
    slug: blogPost.id.toString(),
    lang: "en",
    content: mapBackendBlocksToFrontend(blogPost.content),
    feature_video: blogPost.feature_video,
    category: blogPost.category || "technical",
    stats: blogPost.stats,
    dateDiff: blogPost.date?.diff,
  };

  return <SingleBlogClient blogPost={mappedPost} />;
}
