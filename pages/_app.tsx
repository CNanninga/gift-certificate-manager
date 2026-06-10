import type { AppProps } from "next/app";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "@bigcommerce/big-design";
import { theme as bigDesignTheme } from "@bigcommerce/big-design-theme";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Pages Router app shell. Wires up the BigDesign theme (styled-components
 * `ThemeProvider`), BigDesign's global styles (base typography + normalize),
 * the Geist `next/font` variables, and the global stylesheet around every
 * page. This is the Pages Router equivalent of the App Router `layout.tsx` +
 * `providers.tsx`; styled-components SSR style collection happens in
 * `_document.tsx`, so no client-side registry is needed here.
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={bigDesignTheme}>
      <Head>
        <title>Gift Certificate Manager</title>
        <meta
          name="description"
          content="View and manage gift certificates purchased on your store."
        />
      </Head>
      <GlobalStyles />
      <div className={`${geistSans.variable} ${geistMono.variable}`}>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
}
