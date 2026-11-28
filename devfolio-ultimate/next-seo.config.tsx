// next-seo.config.ts
import { DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  title: "Devfolio | Portfolio Website",
  description:
    "Devfolio is a portfolio website for developers to showcase their projects and skills.",
  canonical: "https://khaled-the-forge.vercel.app/",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://khaled-the-forge.vercel.app/",
    siteName: "Devfolio",
    images: [
      {
        url: "https://khaled-the-forge.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Devfolio",
      },
    ],
  },
  twitter: {
    handle: "@yourhandle",
    site: "@yourwebsite",
    cardType: "summary_large_image",
  },
};

export default config;
