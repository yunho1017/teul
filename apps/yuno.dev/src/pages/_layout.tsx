import "../styles.css";

import type { ReactNode } from "react";

import { Header } from "../components/header";
import { Footer } from "../components/footer";

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="font-['Nunito'] min-h-screen flex flex-col bg-gray-50">
      <meta name="description" content={"Yuno.dev"} />
      <link
        rel="icon"
        type="image/x-icon"
        href={"/public/images/favicon.ico"}
      />
      <Header />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
