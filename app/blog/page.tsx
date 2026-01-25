import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPosts } from "@/lib/blog";
import Link from "next/link";
// Assuming you have a utils file, otherwise I will define a helper locally or import standard one

// Simple date formatter if one doesn't exist in utils, but I recall seeing lib/utils.ts
// I will check lib/utils.ts content next, but for now I'll assume standard JS date formatting in the component if needed.

export const metadata = {
    title: 'Blog | Sanitized AI',
    description: 'Insights on Shadow AI, PII Leakage, and LLM Security.',
};

export default function BlogIndex() {
    const posts = getPosts();

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="flex-1 py-24">
                <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                    <div className="flex flex-col items-center text-center space-y-4 mb-16">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                            Security Insights
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                            Deep dives into Shadow AI, PII protection, and the future of secure LLM adoption.
                        </p>
                    </div>

                    <div className="grid gap-10">
                        {posts.map((post) => (
                            <article key={post.slug} className="group relative flex flex-col space-y-3">
                                <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10" prefetch={true}>
                                    <span className="sr-only">View Article</span>
                                </Link>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <time dateTime={post.metadata.date}>
                                        {new Date(post.metadata.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </time>
                                    <span>•</span>
                                    <span>{post.metadata.author}</span>
                                </div>
                                <h2 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">
                                    {post.metadata.title}
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {post.metadata.summary}
                                </p>
                                <div className="text-blue-400 font-medium group-hover:underline flex items-center">
                                    Read more
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 w-4 h-4"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </div>
                            </article>
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground">
                                <p>No articles published yet. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
