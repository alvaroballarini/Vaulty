import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/providers";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Vaulty — Panel Financiero",
  description:
    "Controla tu saldo, ingresos, gastos, ahorro, presupuestos y objetivos en un solo lugar.",
  generator: "v0.app",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#090e0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`bg-background ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            duration={3000}
            position="bottom-right"
            closeButton
            theme="dark"
            toastOptions={{
              style: { background: "#17211c", color: "#edf3ef", border: "1px solid #3b5145" },
            }}
          />{" "}
        </Providers>
      </body>
    </html>
  );
}
