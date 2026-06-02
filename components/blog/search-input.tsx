"use client"

// 검색 입력 컴포넌트 — URL의 q 파라미터를 업데이트하여 서버 컴포넌트가 검색 결과를 반환하도록 함
// 300ms 디바운스 적용으로 타이핑 중 불필요한 라우팅 방지

import { useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchInputProps {
  /** 초기 검색어 값 (URL q 파라미터에서 전달) */
  defaultValue?: string
}

export function SearchInput({ defaultValue }: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // 디바운스 타이머 참조
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // 이전 타이머 취소
    if (timerRef.current) clearTimeout(timerRef.current)

    // 300ms 후 URL 업데이트
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value.trim()) {
        params.set("q", value.trim())
      } else {
        params.delete("q")
      }

      router.push(`/?${params.toString()}`)
    }, 300)
  }

  return (
    <div className="relative">
      {/* 검색 아이콘 */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="제목 또는 태그로 검색..."
        defaultValue={defaultValue}
        onChange={handleChange}
        className="pl-9"
      />
    </div>
  )
}
