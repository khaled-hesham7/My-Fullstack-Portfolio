import Blogs from "./components/Blogs";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import { generateSEO } from "@/utils/seo";
import { getApiBaseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const homePageUrl = "https://the-forge-one.vercel.app/";
const homePageTitle = "Khaled Hesham | Backend Developer | The Forge";
const homePageDescription =
  "Welcome to the portfolio of Khaled Hesham The Forge, a Backend Developer and Social Work Student. Explore my projects, blog posts, and skills in PHP, Laravel, and modern web development.";
const homePageImage = "https://the-forge-one.vercel.app/seo/home-preview.jpg";

export const metadata = generateSEO({
  title: homePageTitle,
  description: homePageDescription,
  url: homePageUrl,
  image: homePageImage,
  type: "website",
  keywords: [
    "Khaled Hesham",
    "Backend Developer",
    "PHP",
    "Laravel",
    "Sunctum",
    "web development",
    "portfolio",
    "software engineer",
  ],
});

export default async function Home() {
  let data = null;
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/Home`, { cache: "no-store" });
    if (res.ok) {
      const payload = await res.json();
      if (payload.success) {
        data = payload.data;
      }
    }
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
  }

  return (
    <>
      <Hero data={data} />
      <Projects data={data} />
      <Blogs data={data} />
    </>
  );
}
