import { ThemeContextProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://the-forge-one.vercel.app"),
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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${outfit.variable}`} style={{ colorScheme: "dark" }}>
      <body
        className={`${outfit.className} bg-[#030712] dark:bg-deep-dark text-slate-100 font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-300 min-h-screen`}
      >
        <ThemeContextProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
