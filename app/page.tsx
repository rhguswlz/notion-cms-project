// 블로그 홈 페이지 — 발행된 글 목록, 카테고리 필터, 검색 기능 제공
// Server Component: ISR로 1시간마다 재검증

import { Suspense } from "react"
import { getPosts, getCategories } from "@/lib/notion"
import { PostList } from "@/components/blog/post-list"
import { CategoryFilter } from "@/components/blog/category-filter"
import { SearchInput } from "@/components/blog/search-input"
import { PageContainer } from "@/components/layout/page-container"
import { SITE_CONFIG, CATEGORIES } from "@/lib/constants"
import { Skeleton } from "@/components/ui/skeleton"

// ISR 재검증 주기 (1시간)
export const revalidate = 3600

// 페이지 메타데이터
export const metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
}

interface HomePageProps {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Next.js 15+ searchParams는 Promise이므로 await 필요
  const params = await searchParams
  const selectedCategory = params.category
  const searchQuery = params.q

  // Notion API에서 글 목록 및 카테고리 병렬 조회
  const [posts, categories] = await Promise.all([
    getPosts(selectedCategory),
    getCategories(),
  ])

  // 검색어가 있으면 제목 및 태그 기반 클라이언트 필터링
  const filteredPosts = searchQuery
    ? posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : posts

  return (
    <PageContainer>
      {/* 히어로 섹션 */}
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          {SITE_CONFIG.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {SITE_CONFIG.description}
        </p>
      </section>

      {/* 필터 영역: 카테고리 탭 + 검색창 */}
      <section className="mb-8 flex flex-col gap-4">
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <CategoryFilter
            categories={categories}
            allCategories={CATEGORIES}
            selectedCategory={selectedCategory}
          />
        </Suspense>
        <SearchInput defaultValue={searchQuery} />
      </section>

      {/* 글 목록 그리드 */}
      <section>
        <PostList posts={filteredPosts} />
      </section>
    </PageContainer>
  )
}
