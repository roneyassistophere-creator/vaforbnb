import Link from 'next/link'

import { Reveal } from '@/components/motion/Reveal'
import { formatDateTime } from '@/utilities/formatDateTime'
import { getLatestPosts } from '@/utilities/getLatestPosts'
import { eyebrowOnDark, headingOnDark } from '@/utilities/typography'

function estimateReadTime(description?: string | null): string {
  if (!description) return '2 min read'
  const words = description.trim().split(/\s+/).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

export async function BlogPreview() {
  const posts = await getLatestPosts(3).catch(() => [])
  if (posts.length === 0) return null

  return (
    <section id="blog" className="bg-muted py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <Reveal className="mb-20 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div>
            <p className={`mb-4 ${eyebrowOnDark}`}>Insights</p>
            <h2 className={headingOnDark}>Short-Term Rental Tactics.</h2>
          </div>
          <Link
            href="/blog"
            data-cursor="hover"
            className="group border-b border-transparent pb-1 font-mono text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            View All Articles{' '}
            <span className="inline-block text-primary transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {posts.map((post, i) => {
            const category =
              post.categories?.find((c) => typeof c === 'object' && c !== null && 'title' in c) &&
              typeof post.categories[0] === 'object'
                ? (post.categories[0] as { title?: string | null }).title
                : null

            return (
              <Reveal key={post.id} delay={i * 0.1}>
                <Link
                  href={`/blog/${post.slug}`}
                  data-cursor="hover"
                  className="group relative block h-full overflow-hidden border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:bg-card/80"
                >
                  <div className="absolute inset-0 bg-linear-to-t from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="relative z-10 flex h-full flex-col">
                    {category && (
                      <span className="mb-6 inline-block w-fit rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
                        {category}
                      </span>
                    )}

                    <h3 className="mb-4 font-display text-2xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>

                    {post.meta?.description && (
                      <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {post.meta.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-4 font-mono text-xs text-muted-foreground">
                      <span>{post.publishedAt ? formatDateTime(post.publishedAt) : ''}</span>
                      <span>{estimateReadTime(post.meta?.description)}</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
