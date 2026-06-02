// 블로그 포스트 타입 (Notion 데이터베이스 레코드 기반)
export interface Post {
  id: string
  slug: string
  title: string
  category: string
  tags: string[]
  publishedAt: string
  status: "초안" | "발행됨"
  excerpt?: string
}

// 카테고리 타입
export interface Category {
  name: string
  count?: number
}

// Notion 블록 타입
export interface NotionBlock {
  id: string
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// 네비게이션 항목 타입
export type NavItem = {
  label: string
  href: string
  external?: boolean
}

// 사이트 설정 타입
export type SiteConfig = {
  name: string
  description: string
  url: string
}
