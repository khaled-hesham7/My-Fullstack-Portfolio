import { Outfit } from "next/font/google";
import { ThemeContextProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import type { Metadata } from "next";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Khaled Hesham | Backend Developer | The Forge",
  description:
    "Hi, I'm Khaled, a Backend Developer and Social Work student. Explore my projects and articles on PHP, Laravel, and more.",
  keywords: [
    "Khaled Hesham",
    "Backend Developer",
    "PHP",
    "Laravel",
    "Computer Science",
    "portfolio",
    "the Forge",
  ],
  openGraph: {
    title: "Khaled Hesham | Backend Developer | The Forge",
    description:
      "Hi, I'm Khaled, a Backend Developer and Social Work student. Explore my projects and articles on PHP, Laravel, and more.",
    url: "https://the-forge-one.vercel.app/",
    images: ["khalid.jpeg"],
    siteName: "the Forge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Heshamdev",
    creator: "@Heshamdev",
    title: "Khaled Hesham | Backend Developer | The Forge",
    description:
      "Hi, I'm Khaled, a Backend Developer and Social Work student. Explore my projects and articles on PHP, Laravel, and more.",
    images: ["khalid.jpeg"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`bg-white transition-colors dark:bg-deep-dark dark:text-white ${outfit.className}`}
      >
        <ThemeContextProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
