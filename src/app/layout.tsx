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
  themeColor: "#0F1A20",
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
              classNames: {
                // Tarjeta base con borde naranja brillante y sombra de neón sutil
                toast:
                  "!bg-[#131A22] !text-white !border !border-[#FF3D00] shadow-lg shadow-[#FF3D00]/15 rounded-xl",
                title: "!font-semibold !text-white",
                description: "!text-[#A0AEC0]",

                // Icono interno en naranja brillante
                icon: "!text-[#FF3D00]",

                // Botones de acción y cierre integrados con el tema
                actionButton:
                  "!bg-[#FF3D00] !text-white hover:!bg-[#E03600] !border-none transition-colors font-medium",
                cancelButton:
                  "!bg-[#242E38] !text-white hover:!bg-[#2E3B48] !border-none transition-colors",
                closeButton:
                  "!bg-[#131A22] !text-white !border !border-[#FF3D00]/40 hover:!border-[#FF3D00]",

                // Estados
                success: "!bg-[#131A22] !text-white !border !border-[#FF3D00]",
                warning: "!bg-[#131A22] !text-white !border !border-[#FF9800]",
                error: "!bg-[#131A22] !text-white !border !border-[#FF3333]",
                info: "!bg-[#131A22] !text-white !border !border-[#FF3D00]",
              },
            }}
          />{" "}
        </Providers>
      </body>
    </html>
  );
}
