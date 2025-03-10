import { type ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    email: string;
  } | null;
}

const Layout = ({ children, user }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
