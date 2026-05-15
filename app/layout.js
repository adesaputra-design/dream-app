import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Telusuri Mimpimu — Ade Saputra",
  description:
    "Mimpi bisa dipelajari dan ditelusuri. Mulai perjalanan memahami alam bawah sadarmu bersama Ade Saputra, praktisi psikoterapi psikoanalisis.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${playfair.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
