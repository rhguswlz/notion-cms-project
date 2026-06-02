import { z } from "zod"

// 검색 폼 스키마
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "검색어를 입력해주세요")
    .max(100, "검색어는 100자 이내로 입력해주세요"),
})

export type SearchValues = z.infer<typeof searchSchema>
