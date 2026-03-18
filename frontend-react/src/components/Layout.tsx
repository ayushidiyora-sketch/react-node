import { TopBar, Header, Navigation } from "@/components/HeaderNav";
import { Footer } from "@/components/Sections";
import { NewsletterBanner } from "@/components/NewsletterBanner";

interface LayoutProps {
  children: React.ReactNode;
  showNewsletter?: boolean;
}

export const Layout = ({ children, showNewsletter = true }: LayoutProps) => (
  <div className="min-h-screen bg-background">
    <TopBar />
    <Header />
    <Navigation />
    {children}
    {showNewsletter && <NewsletterBanner />}
    <Footer />
  </div>
);
