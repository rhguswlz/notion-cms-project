// 블로그 포스트 카드 컴포넌트 — 목록 페이지에서 개별 글을 카드 형태로 표시
import Link from "next/link"
import type { Post } from "@/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  // 발행일을 한국어 날짜 형식으로 변환
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          {/* 카테고리 배지 */}
          <div className="mb-2">
            <Badge variant="secondary">{post.category}</Badge>
          </div>
          {/* 글 제목 */}
          <h2 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </CardHeader>

        <CardContent className="pb-2">
          {/* 발췌문 (있는 경우에만 표시) */}
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-2 pt-2">
          {/* 발행일 */}
          <time
            dateTime={post.publishedAt}
            className="text-xs text-muted-foreground"
          >
            {formattedDate}
          </time>

          {/* 태그 목록 (최대 3개) */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {/* 태그가 3개 초과인 경우 나머지 개수 표시 */}
              {post.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}
