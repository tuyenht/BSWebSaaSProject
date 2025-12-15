import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BSWeb SaaS",
  description: "BSWeb SaaS Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

