import "./globals.css";
import Nav from "../components/nav";
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
          <Nav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
