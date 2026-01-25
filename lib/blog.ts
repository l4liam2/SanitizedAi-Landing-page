import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the path to the content directory
const postsDirectory = path.join(process.cwd(), 'content/posts');

// Define the type for a blog post
export type Post = {
    slug: string;
    metadata: {
        title: string;
        date: string;
        summary: string;
        image?: string;
        tags?: string[];
        author?: string;
    };
    content: string;
};

// Retrieve all blog posts, sorted by date
export function getPosts(): Post[] {
    // Get file names under /content/posts
    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.mdx') || fileName.endsWith('.md'))
        .map((fileName) => {
            // Remove extension from file name to get id
            const slug = fileName.replace(/\.mdx?$/, '');

            // Read markdown file as string
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            // Use gray-matter to parse the post metadata section
            const { data, content } = matter(fileContents);

            return {
                slug,
                metadata: data as Post['metadata'],
                content,
            };
        });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.metadata.date < b.metadata.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

// Retrieve a single blog post by slug
export function getPostBySlug(slug: string): Post | undefined {
    try {
        let fullPath = path.join(postsDirectory, `${slug}.mdx`);

        // If .mdx doesn't exist, try .md
        if (!fs.existsSync(fullPath)) {
            fullPath = path.join(postsDirectory, `${slug}.md`);
        }

        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const { data, content } = matter(fileContents);

        return {
            slug,
            metadata: data as Post['metadata'],
            content,
        };
    } catch (error) {
        return undefined;
    }
}
