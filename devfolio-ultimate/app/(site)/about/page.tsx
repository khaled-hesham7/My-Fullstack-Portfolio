// app/about/page.tsx
import { generateSEO } from "@/utils/seo";
import { getApiBaseUrl } from "@/lib/utils";
import AboutClient from "./AboutClientPage";

const aboutPageUrl = "https://the-forge-one.vercel.app/about";
const aboutPageTitle =
  "About Khaled Hesham | Backend Developer | The Forge";
const aboutPageDescription =
  "Learn more about Khaled Hesham, a Backend Developer and Computer Science student. View my skills, experience, and academic background.";
const aboutPageImage = "https://the-forge-one.vercel.app/khalid.jpeg";

export const metadata = generateSEO({
  title: aboutPageTitle,
  description: aboutPageDescription,
  url: aboutPageUrl,
  image: aboutPageImage,
  type: "article",
  keywords: [
    "Khaled Hesham",
    "Backend Developer",
    "PHP",
    "Laravel",
    "portfolio",
    "skills",
    "experience",
    "about",
  ],
});

export default async function AboutPage() {
  let data = null;
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/portfolio-data`, {
      cache: "no-store",
    });
    if (res.ok) {
      const payload = await res.json();
      if (payload.success) {
        data = payload.data;
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to fetch portfolio data:", error);
    }
  }

  return <AboutClient data={data} />;
}

