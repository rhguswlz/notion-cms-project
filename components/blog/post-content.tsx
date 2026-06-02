// 노션 블록 렌더러 — NotionBlock 배열을 HTML 요소로 변환하여 글 본문을 표시
// 지원 블록 타입: paragraph, heading_1~3, bulleted_list_item, numbered_list_item,
//               image, quote, code, divider

import Image from "next/image"
import type { NotionBlock } from "@/types"

interface PostContentProps {
  /** 노션 API에서 가져온 블록 목록 */
  blocks: NotionBlock[]
}

// 리치텍스트 배열에서 순수 텍스트 추출 헬퍼
function extractText(richText: Array<{ plain_text?: string }>): string {
  return (richText ?? []).map((t) => t.plain_text ?? "").join("")
}

// 단일 블록을 JSX로 변환
function renderBlock(block: NotionBlock) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={block.id} className="mb-4 leading-7 text-foreground/90">
          {extractText(block.paragraph?.rich_text ?? [])}
        </p>
      )

    case "heading_1":
      return (
        <h1 key={block.id} className="mt-8 mb-4 text-3xl font-bold tracking-tight">
          {extractText(block.heading_1?.rich_text ?? [])}
        </h1>
      )

    case "heading_2":
      return (
        <h2 key={block.id} className="mt-6 mb-3 text-2xl font-semibold tracking-tight">
          {extractText(block.heading_2?.rich_text ?? [])}
        </h2>
      )

    case "heading_3":
      return (
        <h3 key={block.id} className="mt-5 mb-2 text-xl font-semibold">
          {extractText(block.heading_3?.rich_text ?? [])}
        </h3>
      )

    case "bulleted_list_item":
      return (
        <li key={block.id} className="mb-1 ml-6 list-disc leading-7">
          {extractText(block.bulleted_list_item?.rich_text ?? [])}
        </li>
      )

    case "numbered_list_item":
      return (
        <li key={block.id} className="mb-1 ml-6 list-decimal leading-7">
          {extractText(block.numbered_list_item?.rich_text ?? [])}
        </li>
      )

    case "quote":
      return (
        <blockquote
          key={block.id}
          className="my-4 border-l-4 border-primary pl-4 italic text-muted-foreground"
        >
          {extractText(block.quote?.rich_text ?? [])}
        </blockquote>
      )

    case "code": {
      const lang = block.code?.language ?? ""
      return (
        <pre
          key={block.id}
          className="my-4 overflow-x-auto rounded-md bg-muted p-4 text-sm"
        >
          <code data-lang={lang}>
            {extractText(block.code?.rich_text ?? [])}
          </code>
        </pre>
      )
    }

    case "divider":
      return <hr key={block.id} className="my-6 border-border" />

    case "image": {
      // 외부 URL 또는 노션 파일 URL 처리
      const src =
        block.image?.external?.url ?? block.image?.file?.url ?? ""
      const caption = extractText(block.image?.caption ?? [])

      if (!src) return null

      return (
        <figure key={block.id} className="my-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={src}
              alt={caption || "글 이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }

    default:
      // 지원하지 않는 블록 타입은 무시
      return null
  }
}

export function PostContent({ blocks }: PostContentProps) {
  if (!blocks.length) {
    return (
      <p className="text-muted-foreground">본문 내용이 없습니다.</p>
    )
  }

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {blocks.map((block) => renderBlock(block))}
    </article>
  )
}
