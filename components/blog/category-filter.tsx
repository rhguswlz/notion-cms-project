"use client"

// 카테고리 필터 컴포넌트 — 클라이언트 컴포넌트 (URL 파라미터 조작 필요)
// 선택된 카테고리를 URL searchParams에 반영하여 서버 컴포넌트 재요청을 유발함

import { useRouter, useSearchParams } from "next/navigation"
import type { Category } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  /** Notion에서 실제 집계된 카테고리 목록 (글 수 포함) */
  categories: Category[]
  /** constants에 정의된 전체 카테고리 기준 목록 */
  allCategories: string[]
  /** 현재 선택된 카테고리 (없으면 전체) */
  selectedCategory?: string
}

export function CategoryFilter({
  categories,
  allCategories,
  selectedCategory,
}: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 카테고리 버튼 클릭 시 URL 업데이트
  const handleSelect = (category: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())

    if (category) {
      params.set("category", category)
    } else {
      // 전체 선택 시 category 파라미터 제거
      params.delete("category")
    }

    // 카테고리 변경 시 검색어는 초기화
    params.delete("q")

    router.push(`/?${params.toString()}`)
  }

  // 실제 글이 있는 카테고리 이름 집합 (빠른 조회)
  const activeCategoryNames = new Set(categories.map((c) => c.name))

  // 카테고리별 글 수 맵
  const countMap = new Map(categories.map((c) => [c.name, c.count ?? 0]))

  return (
    <div className="flex flex-wrap gap-2">
      {/* 전체 버튼 */}
      <button
        onClick={() => handleSelect(undefined)}
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors",
          !selectedCategory
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
        )}
      >
        전체
      </button>

      {/* 카테고리 목록 — allCategories 기준으로 렌더링 */}
      {allCategories.map((name) => {
        const isSelected = selectedCategory === name
        const count = countMap.get(name)
        const hasArticles = activeCategoryNames.has(name)

        return (
          <button
            key={name}
            onClick={() => handleSelect(name)}
            disabled={!hasArticles}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : hasArticles
                  ? "bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                  : "bg-background text-muted-foreground/40 border-border/40 cursor-not-allowed"
            )}
          >
            {name}
            {/* 해당 카테고리 글 수 표시 */}
            {hasArticles && count !== undefined && (
              <Badge
                variant="secondary"
                className="h-4 min-w-4 px-1 text-xs leading-none"
              >
                {count}
              </Badge>
            )}
          </button>
        )
      })}
    </div>
  )
}
