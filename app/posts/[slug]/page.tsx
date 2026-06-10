// 글 상세 페이지 — Notion 슬러그 기반으로 개별 글을 렌더링
// Server Component: ISR로 1시간마다 재검증

import { cache } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getPosts, getPost, getPostBlocks } from "@/lib/notion"
import { PostContent } from "@/components/blog/post-content"
import { PageContainer } from "@/components/layout/page-container"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SITE_CONFIG } from "@/lib/constants"

// ISR 재검증 주기 (1시간)
export const revalidate = 3600

// 정적으로 생성되지 않은 경로도 런타임에서 허용
export const dynamicParams = true

// getPost를 캐싱하여 generateMetadata와 Page 컴포넌트 간 중복 API 호출 방지
const getCachedPost = cache(getPost)

/**
 * 빌드 시 발행된 모든 글의 정적 경로를 미리 생성
 * API 오류 시 빈 배열을 반환하여 빌드 실패를 방지
 */
export async function generateStaticParams() {
  try {
    const posts = await getPosts()
    return posts.map((post) => ({ slug: post.slug }))
  } catch {
    // Notion API 오류 또는 환경 변수 미설정 시 빈 배열 폴백
    return []
  }
}

/**
 * 글 제목 기반 동적 메타데이터 생성
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  // Next.js 16: params는 Promise이므로 반드시 await
  const { slug } = await params
  const post = await getCachedPost(slug)

  if (!post) {
    return { title: "글을 찾을 수 없습니다" }
  }

  const title = `${post.title} | ${SITE_CONFIG.name}`
  const url = `${SITE_CONFIG.url}/posts/${slug}`

  return {
    title,
    description: post.excerpt,
    openGraph: {
      title,
      description: post.excerpt,
      type: "article",
      url,
      siteName: SITE_CONFIG.name,
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.excerpt,
    },
  }
}

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  // Next.js 16: params는 Promise이므로 반드시 await
  const { slug } = await params

  // 캐싱된 getPost 호출 — generateMetadata와 동일 요청 공유
  const post = await getCachedPost(slug)

  // 존재하지 않는 슬러그 접근 시 404 페이지 표시
  if (!post) {
    notFound()
  }

  // 본문 블록과 전체 글 목록을 병렬로 조회하여 응답 시간 최소화
  const [blocks, allPosts] = await Promise.all([
    getPostBlocks(post.id),
    getPosts(),
  ])

  // 이전/다음 글 탐색 — getPosts()는 최신순 정렬이므로:
  // currentIndex + 1 = 더 오래된 글 (이전 글)
  // currentIndex - 1 = 더 최신 글 (다음 글)
  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  // 발행일을 한국어 날짜 형식으로 변환
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <PageContainer narrow className="py-8">
      {/* 목록으로 돌아가기 링크 */}
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← 목록으로 돌아가기
      </Link>

      <article className="mt-6">
        {/* 글 메타 헤더: 카테고리, 제목, 발행일, 태그 */}
        <header>
          {/* 카테고리 배지 */}
          <Badge variant="secondary">{post.category}</Badge>

          {/* 글 제목 */}
          <h1 className="mt-3 text-3xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* 발행일 */}
          <time
            dateTime={post.publishedAt}
            className="mt-2 block text-sm text-muted-foreground"
          >
            {formattedDate}
          </time>

          {/* 태그 목록 (있는 경우에만 표시) */}
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <Separator className="my-6" />

        {/* Notion 블록 기반 본문 렌더링 */}
        <PostContent blocks={blocks} />
      </article>

      <Separator className="my-8" />

      {/* 이전 글 / 다음 글 네비게이션 */}
      <nav className="flex justify-between gap-4">
        {/* 이전 글 (더 오래된 글) */}
        {prevPost ? (
          <Link
            href={`/posts/${prevPost.slug}`}
            className="max-w-xs text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
          >
            ← {prevPost.title}
          </Link>
        ) : (
          <div />
        )}

        {/* 다음 글 (더 최신 글) */}
        {nextPost ? (
          <Link
            href={`/posts/${nextPost.slug}`}
            className="max-w-xs text-sm text-muted-foreground hover:text-foreground transition-colors truncate text-right"
          >
            {nextPost.title} →
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </PageContainer>
  )
}
