import type { NavItem, SiteConfig } from "@/types"

// 사이트 기본 설정
export const SITE_CONFIG: SiteConfig = {
  name: "미국주식 인사이트",
  description: "미국주식 핵심 정보를 매일 전달합니다",
  url: "https://us-stock-blog.vercel.app",
}

// 헤더 네비게이션 항목
export const NAV_ITEMS: NavItem[] = [
  { label: "홈", href: "/" },
  { label: "시장 동향", href: "/category/시장 동향" },
  { label: "종목 분석", href: "/category/종목 분석" },
  { label: "ETF 정보", href: "/category/ETF 정보" },
]

// 블로그 카테고리 목록
export const CATEGORIES = [
  "시장 동향",
  "종목 분석",
  "경제 지표",
  "ETF 정보",
  "실적 발표",
  "투자 전략",
]

// ISR 캐싱 시간 (초 단위, 1시간)
export const ISR_REVALIDATE = 3600
