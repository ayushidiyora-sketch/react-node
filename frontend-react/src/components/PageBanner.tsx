import { Link } from "react-router-dom";

interface PageBannerProps {
  title: string;
  breadcrumbs: { label: string; path?: string }[];
}

export const PageBanner = ({ title, breadcrumbs }: PageBannerProps) => (
  <div className="bg-secondary py-8">
    <div className="container mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span>/</span>}
            {crumb.path ? (
              <Link to={crumb.path} className="hover:text-primary transition-colors">{crumb.label}</Link>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
      <h1 className="text-3xl lg:text-4xl font-bold font-display text-foreground text-center">{title}</h1>
    </div>
  </div>
);
