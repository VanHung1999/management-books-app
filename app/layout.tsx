import RefineWrapper from "./providers/RefineWrapper";
import Navbar from "./components/layout/Navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="mdl-js">
      <body>
        <RefineWrapper>
          <Navbar>
            {children}
          </Navbar>
        </RefineWrapper>
      </body>
    </html>
  );
}
