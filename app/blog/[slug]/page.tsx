import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPosts, getPostBySlug } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
    const posts = getPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = getPostBySlug(params.slug);
    if (!post) {
        return;
    }
    return {
        title: `${post.metadata.title} | Sanitized AI`,
        description: post.metadata.summary,
    };
}

const components = {
    // Add custom components here if needed in MDX
};

const options = {
    theme: 'github-dark',
    keepBackground: true,
};

export default function BlogPost({ params }: { params: { slug: string } }) {
    const post = getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <Suspense fallback={null}>
            <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-50">
                <Navbar />
                <main className="flex-1 py-24">
                    <div className="container px-4 md:px-6 mx-auto max-w-3xl">

                        <div className="mb-8">
                            <Link href="/blog" className="inline-flex items-center text-sm text-neutral-400 hover:text-white transition-colors">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </Link>
                        </div>

                        <article className="prose prose-invert prose-blue max-w-none">
                            <header className="mb-10 text-center not-prose">
                                <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500 mb-4">
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
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-6">
                                    {post.metadata.title}
                                </h1>
                            </header>

                            <div className="mdx-content">
                                <MDXRemote
                                    source={post.content}
                                    components={components}
                                    options={{
                                        mdxOptions: {
                                            remarkPlugins: [],
                                            rehypePlugins: [
                                                rehypeSlug,
                                                [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                                                [rehypePrettyCode, options],
                                            ],
                                        },
                                    }}
                                />
                            </div>
                        </article>
                    </div>
                </main>
                <Footer />
            </div>
        </Suspense>
    );
}
