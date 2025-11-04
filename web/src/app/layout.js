import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

import { ThemeProvider } from "../contexts/ThemeContext";

export const metadata = {
  title: "Niels Windfeldt",
  description:
    "Niels Windfeldt is a Norwegian director and former professional athlete who specializes in creating cinematic films using analog video to capture nature's beauty and mystery. ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <ThemeProvider>
          <Navigation />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
