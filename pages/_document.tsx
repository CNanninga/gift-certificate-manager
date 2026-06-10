import Document, {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

/**
 * Custom Document for styled-components SSR (the classic Pages Router pattern).
 *
 * BigDesign is built on styled-components, so its styles must be collected
 * during server rendering and injected into the initial HTML to avoid a flash
 * of unstyled content. `getInitialProps` wraps the app in a `ServerStyleSheet`,
 * renders it to collect the rules, and merges the resulting <style> tags into
 * the document head.
 *
 * This replaces the App Router `useServerInsertedHTML` registry.
 */
export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en" className="h-full antialiased">
        <Head>
          {/* BigDesign's theme references "Source Sans 3" by name, so load it
              directly here in the document head (applies app-wide). */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@200;300;400;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="min-h-full flex flex-col">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
