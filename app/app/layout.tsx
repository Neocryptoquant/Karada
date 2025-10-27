import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";
import Header from "@/components/Header";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "KARADA - Draw, Guess, Win SOL",
  description: "The first Web3 drawing game on Solana with real stakes. Draw, guess, and win SOL!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <WalletProvider>
          <Header />
          <div className="pt-16">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
}
