import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { User, MessageSquare, ArrowRight } from "lucide-react";

const blogPosts = [
  { id: 1, title: "Reprehenderit non esse anim laboris reprehenderit officia", excerpt: "Irure laborum qui deserunt excepteur id ad sit quis laboris duis ut cillum eiusmod non sint exercitation nulla tempor nostrud eiusmod commodo mollit magna sint laboris excepteur elit cupidatat id.", author: "admin", comments: 6 },
  { id: 2, title: "Aliquip duis nostrud ex cillum laborum adipisicing", excerpt: "Adipisicing dolor esse voluptate occaecat laborum fugiat adipisicing laboris id cupidatat deserunt exercitation et velit consectetur eiusmod pariatur ullamco enim ut nulla qui minim sunt minim amet non culpa aliqua.", author: "admin", comments: 8 },
  { id: 3, title: "Consequat qui non irure mollit laboris id", excerpt: "Incididunt nisi minim elit occaecat nostrud do non commodo commodo magna est et ex consequat amet fugiat aute magna reprehenderit consequat ut quis qui reprehenderit officia nostrud ex amet excepteur.", author: "admin", comments: 14 },
  { id: 4, title: "Esse est in mollit nostrud adipisicing duis", excerpt: "Veniam mollit cillum aliquip quis proident cupidatat aute do cupidatat magna non ea laborum pariatur dolor sit anim et duis duis ut cupidatat cillum consectetur pariatur tempor eiusmod ea eiusmod.", author: "admin", comments: 2 },
  { id: 5, title: "Eiusmod elit deserunt eiusmod ea velit quis", excerpt: "Nisi anim culpa nisi ullamco est laborum reprehenderit proident ex anim quis adipisicing tempor officia nulla deserunt ex duis consequat laboris esse mollit ea excepteur ullamco deserunt elit cupidatat cillum.", author: "admin", comments: 20 },
  { id: 6, title: "Lorem culpa qui proident est mollit officia", excerpt: "Ut sit velit esse laborum ad dolor voluptate nostrud dolore labore ipsum voluptate labore mollit exercitation veniam pariatur ipsum eiusmod irure Lorem ad culpa commodo deserunt laborum eu voluptate sint.", author: "admin", comments: 10 },
];

const Blog = () => (
  <Layout>
    <PageBanner title="Our Blogs" breadcrumbs={[{ label: "Home", path: "/" }, { label: "Blogs" }]} />

    <section className="py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.map(post => (
            <article key={post.id} className="bg-card rounded-lg border border-border overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-secondary" />
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-accent mb-3">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> By {post.author}</span>
                  <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {post.comments} Comments</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors capitalize">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  View More <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Blog;
