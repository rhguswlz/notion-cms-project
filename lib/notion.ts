import { Client } from "@notionhq/client"
import type { Post, Category, NotionBlock } from "@/types"
import { ISR_REVALIDATE } from "./constants"

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Notion 데이터베이스 ID (환경변수에서 읽어옴)
const DATABASE_ID = process.env.NOTION_DATABASE_ID!

// ISR_REVALIDATE 사용 여부 표시 (정적 참조 방지)
export const _isr = ISR_REVALIDATE

/**
 * Notion RichText 배열에서 순수 텍스트를 추출하는 헬퍼 함수
 */
function getTextFromRichText(richText: Array<{ plain_text?: string }>): string {
  if (!richText || richText.length === 0) return ""
  return richText.map((block) => block.plain_text ?? "").join("")
}

/**
 * Notion 페이지 객체를 블로그 Post 타입으로 변환
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notionPageToPost(page: any): Post {
  const props = page.properties

  // 슬러그 추출 (Notion Title 속성)
  const titleRichText = props.Name?.title ?? props.Title?.title ?? []
  const title = getTextFromRichText(titleRichText)

  // 슬러그: 별도 속성이 있으면 사용, 없으면 제목 기반으로 생성
  const slugRichText = props.Slug?.rich_text ?? []
  const slug =
    slugRichText.length > 0
      ? getTextFromRichText(slugRichText)
      : title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-가-힣]/g, "")

  // 카테고리 추출 (Select 속성)
  const category = props.Category?.select?.name ?? "미분류"

  // 태그 추출 (Multi-select 속성)
  const tags: string[] = (props.Tags?.multi_select ?? []).map(
    (tag: { name: string }) => tag.name
  )

  // 발행일 추출
  const publishedAt =
    props.PublishedAt?.date?.start ??
    props["Published At"]?.date?.start ??
    page.created_time ??
    new Date().toISOString()

  // 발행 상태 추출 (Status 또는 Select 속성)
  const statusValue =
    props.Status?.select?.name ??
    props.Status?.status?.name ??
    "초안"
  const status: Post["status"] = statusValue === "발행됨" ? "발행됨" : "초안"

  // 발췌문 추출 (optional)
  const excerptRichText = props.Excerpt?.rich_text ?? []
  const excerpt =
    excerptRichText.length > 0 ? getTextFromRichText(excerptRichText) : undefined

  return {
    id: page.id,
    slug,
    title,
    category,
    tags,
    publishedAt,
    status,
    excerpt,
  }
}

/**
 * 발행된 블로그 글 목록을 조회합니다.
 * @param category - 필터링할 카테고리 (선택적)
 * @returns Post 배열
 */
export async function getPosts(category?: string): Promise<Post[]> {
  try {
    // 카테고리 필터 조건 구성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      and: [
        {
          property: "Status",
          select: { equals: "발행됨" },
        },
      ],
    }

    // 카테고리가 지정된 경우 필터 추가
    if (category) {
      filter.and.push({
        property: "Category",
        select: { equals: category },
      })
    }

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter,
      sorts: [
        {
          property: "PublishedAt",
          direction: "descending",
        },
      ],
    })

    return response.results.map(notionPageToPost)
  } catch (error) {
    // 환경변수 미설정 또는 API 오류 시 빈 배열 반환
    console.error("Notion 글 목록 조회 오류:", error)
    return []
  }
}

/**
 * 슬러그로 특정 블로그 글을 조회합니다.
 * @param slug - 글 슬러그
 * @returns Post 또는 null
 */
export async function getPost(slug: string): Promise<Post | null> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "Slug",
        rich_text: { equals: slug },
      },
    })

    if (response.results.length === 0) return null

    return notionPageToPost(response.results[0])
  } catch (error) {
    console.error(`Notion 글 조회 오류 (slug: ${slug}):`, error)
    return null
  }
}

/**
 * 특정 Notion 페이지의 블록(본문) 목록을 조회합니다.
 * @param pageId - Notion 페이지 ID
 * @returns NotionBlock 배열
 */
export async function getPostBlocks(pageId: string): Promise<NotionBlock[]> {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    })

    return response.results as NotionBlock[]
  } catch (error) {
    console.error(`Notion 블록 조회 오류 (pageId: ${pageId}):`, error)
    return []
  }
}

/**
 * 데이터베이스의 카테고리 목록과 글 수를 조회합니다.
 * @returns Category 배열
 */
export async function getCategories(): Promise<Category[]> {
  try {
    // 발행된 모든 글을 가져와 카테고리별 집계
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "Status",
        select: { equals: "발행됨" },
      },
    })

    // 카테고리별 게시글 수 집계
    const categoryMap = new Map<string, number>()

    response.results.forEach((page) => {
      const post = notionPageToPost(page)
      const current = categoryMap.get(post.category) ?? 0
      categoryMap.set(post.category, current + 1)
    })

    // 게시글 수 기준 내림차순 정렬
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
  } catch (error) {
    console.error("Notion 카테고리 조회 오류:", error)
    return []
  }
}
