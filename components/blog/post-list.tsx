// 블로그 포스트 목록 컴포넌트 — Post 배열을 그리드 형태로 렌더링
import type { Post } from "@/types"
import { PostCard } from "@/components/blog/post-card"

interface PostListProps {
  posts: Post[]
}

export function PostList({ posts }: PostListProps) {
  // 글이 없을 때 안내 메시지 표시
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          아직 게시된 글이 없습니다.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          검색 조건을 변경하거나 나중에 다시 확인해주세요.
        </p>
      </div>
    )
  }

  return (
    // 반응형 그리드: 모바일 1열, 태블릿 2열, 데스크탑 3열
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
