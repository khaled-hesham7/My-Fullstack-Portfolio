
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MouseGlow from "./components/MouseGlow";
import ScatteredBackdrop from "./components/ScatteredBackdrop";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MouseGlow />
      <ScatteredBackdrop />
      <Navbar />
      <main className="min-h-screen pt-12">{children}</main>
      <Footer />
    </>
  );
}

