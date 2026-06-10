# Development Guidelines

## 프로젝트 개요

Notion을 CMS로 사용하는 미국주식 정보 블로그. Next.js 16.2.6 App Router + React 19 + TypeScript strict + Tailwind v4 + shadcn/ui. `lib/notion.ts`가 유일한 데이터 접근 레이어.

---

## 디렉토리 구조 & 파일 배치 규칙

| 경로 | 역할 | 규칙 |
|------|------|------|
| `types/index.ts` | 모든 공통 타입 정의 | 타입은 반드시 이 파일에만 정의 |
| `lib/notion.ts` | Notion API 클라이언트 + 모든 데이터 조회 함수 | `@notionhq/client`는 이 파일에서만 import |
| `lib/constants.ts` | `SITE_CONFIG`, `NAV_ITEMS`, `CATEGORIES`, `ISR_REVALIDATE` | 사이트 설정 변경은 이 파일만 수정 |
| `lib/validations.ts` | Zod 스키마 정의 | 폼 검증 스키마는 여기에만 |
| `lib/utils.ts` | `cn()` 유틸리티 | 클래스 병합은 `cn()` 함수만 사용 |
| `components/ui/` | shadcn/ui 설치 컴포넌트 | `npx shadcn@latest add`로만 추가, 직접 생성 금지 |
| `components/blog/` | 블로그 전용 컴포넌트 | `PostCard`, `PostList`, `PostContent`, `CategoryFilter`, `SearchInput` |
| `components/layout/` | 공통 레이아웃 컴포넌트 | `Header`, `Footer`, `PageContainer`, `Section` |
| `components/` 루트 | 전역 공통 컴포넌트 | `Providers`, `MobileMenu`, `NavLink`, `ThemeToggle` |
| `app/` | Next.js App Router 페이지 | Server Component 기본, `"use client"` 최소화 |
| `hooks/` | 커스텀 훅 | `use-mobile.ts` 존재. 새 훅은 `use-[name].ts` 형식 |
| `docs/` | PRD.md, ROADMAP.md | 수정하지 않음 (참조용) |

---

## ⚠️ 다중 파일 연동 규칙 (반드시 동시 수정)

### 새 카테고리 추가 시
1. `lib/constants.ts` → `CATEGORIES` 배열에 추가
2. `lib/constants.ts` → `NAV_ITEMS`에 `/category/[카테고리명]` 링크 추가 (상단 3개 노출 기준)

### 새 타입 추가 시
1. `types/index.ts`에만 정의
2. 사용 파일에서 `import type { ... } from "@/types"` 추가

### 새 Notion API 함수 추가 시
1. `lib/notion.ts`에만 추가
2. 함수 시그니처에 JSDoc 한글 주석 추가
3. try/catch로 감싸고 오류 시 빈 배열 또는 `null` 반환

### 새 페이지 생성 시
1. `app/[route]/page.tsx` 생성
2. `export const revalidate = 3600` 추가 (ISR 필수)
3. 동적 라우트면 `generateStaticParams()` + `export const dynamicParams = true` 추가
4. `generateMetadata()` 추가 (SEO 필수)

### Notion 이미지 사용 시
1. `next.config.ts`의 `images.remotePatterns`에 Notion CDN 도메인 추가
   - `s3.us-west-2.amazonaws.com`
   - `prod-files-secure.s3.us-west-2.amazonaws.com`

### 사이트 설정 변경 시
1. `lib/constants.ts`의 `SITE_CONFIG` 수정
2. `app/layout.tsx`의 `metadata`는 `SITE_CONFIG`를 참조하므로 자동 반영 (별도 수정 불필요)

---

## 코드 작성 표준

- **들여쓰기:** 2칸 공백
- **변수/함수명:** camelCase (영어)
- **컴포넌트명:** PascalCase
- **파일명:** kebab-case (`post-card.tsx`, `use-mobile.ts`)
- **주석 언어:** 한국어 필수
- **import 경로:** `@/` alias 사용 (`../../components` 형식 금지)
- **클래스 병합:** `cn()` 함수만 사용 (`lib/utils.ts`에서 import)

```typescript
// ✅ 올바른 예
import { cn } from "@/lib/utils"
import type { Post } from "@/types"
className={cn("base-class", isActive && "active-class")}

// ❌ 잘못된 예
import { cn } from "../../lib/utils"
className={`base-class ${isActive ? "active-class" : ""}`}
```

---

## Next.js 16 필수 패턴

### searchParams는 반드시 await
```typescript
// ✅ Next.js 15+ 필수 패턴
interface PageProps {
  searchParams: Promise<{ category?: string; q?: string }>
}
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const category = params.category
}

// ❌ 금지 — Next.js 13/14 구형 패턴
export default async function Page({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category  // 오류 발생
}
```

### params도 반드시 await
```typescript
// ✅ 올바른 예
interface PageProps {
  params: Promise<{ slug: string }>
}
export default async function Page({ params }: PageProps) {
  const { slug } = await params
}
```

### generateStaticParams — 오류 시 빈 배열 폴백
```typescript
export async function generateStaticParams() {
  try {
    const posts = await getPosts()
    return posts.map((post) => ({ slug: post.slug }))
  } catch {
    return []  // 빌드 실패 방지
  }
}
export const dynamicParams = true  // 정적 생성 안 된 경로도 허용
```

---

## Notion API 사용 규칙

### 클라이언트는 lib/notion.ts에서만 초기화
```typescript
// lib/notion.ts 내부에서만
import { Client } from "@notionhq/client"
const notion = new Client({ auth: process.env.NOTION_API_KEY })
```

### Status 필터는 select 타입 사용
```typescript
// ✅ 올바른 필터 (Status 속성은 select 타입)
filter: { property: "Status", select: { equals: "발행됨" } }

// ❌ 잘못된 필터 (status 타입 아님)
filter: { property: "Status", status: { equals: "발행됨" } }
```

### 슬러그 생성 규칙
- Notion 페이지에 `Slug` rich_text 속성이 있으면 우선 사용
- 없으면 제목 기반 자동 생성: 소문자 + 공백을 `-` + 한글 허용
```typescript
const slug = slugRichText.length > 0
  ? getTextFromRichText(slugRichText)
  : title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-가-힣]/g, "")
```

### 발행일 필드명 양쪽 처리
```typescript
// Notion 필드명이 "PublishedAt" 또는 "Published At"일 수 있으므로 둘 다 처리
const publishedAt = props.PublishedAt?.date?.start ?? props["Published At"]?.date?.start ?? page.created_time
```

### 오류 처리 원칙
- 모든 Notion API 함수는 try/catch로 감쌀 것
- 오류 시 `return []` 또는 `return null` (throw 금지)
- `console.error()`로 오류 로깅 필수

---

## 컴포넌트 작성 규칙

### "use client" 선언 기준
- `useRouter`, `useSearchParams`, `useState`, `useEffect`, `useRef` 사용 시만 추가
- 데이터 표시 전용 컴포넌트는 Server Component 유지

| 컴포넌트 | 타입 | 이유 |
|---------|------|------|
| `CategoryFilter` | Client | `useRouter`, `useSearchParams` 사용 |
| `SearchInput` | Client | `useRouter`, `useRef` 사용 |
| `ThemeToggle` | Client | `useTheme` 사용 |
| `MobileMenu` | Client | Sheet 상태 관리 |
| `PostCard` | Server | 정적 표시만 |
| `PostList` | Server | 정적 표시만 |
| `PostContent` | Server | 정적 표시만 |
| `Header` | Server | 정적 네비게이션 |

### shadcn/ui 컴포넌트 사용법
```typescript
// ✅ components/ui/ 에서 import
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"

// ❌ 새 shadcn/ui 컴포넌트 직접 생성 금지 — 반드시 CLI로 추가
// npx shadcn@latest add [component-name]
```

### PostContent 블록 렌더러 확장 시
- `components/blog/post-content.tsx`의 `renderBlock()` switch 문에 케이스 추가
- 미지원 블록은 `default: return null` 유지 (오류 대신 무시)

---

## ISR & 캐싱 규칙

- 모든 페이지에 `export const revalidate = 3600` 선언 (1시간)
- `lib/constants.ts`의 `ISR_REVALIDATE = 3600` 값을 직접 숫자로 쓰지 말고 상수 참조
- ISR 즉시 갱신 API: `app/api/revalidate/route.ts` (미구현, 단계 4에서 추가 예정)
  - 구현 시 `REVALIDATE_SECRET` 환경 변수로 인증
  - `revalidatePath('/', 'layout')` 호출

---

## 타입 관리 규칙

- 모든 공통 타입은 `types/index.ts`에만 정의
- 컴포넌트 내부 전용 타입(Props 인터페이스)은 해당 파일 내에 정의
- Notion API 응답의 `any` 타입: `// eslint-disable-next-line @typescript-eslint/no-explicit-any` 주석 추가 후 사용

```typescript
// types/index.ts 현재 정의된 타입
// Post, Category, NotionBlock, NavItem, SiteConfig
// 새 타입 추가 시 이 파일에 append
```

---

## 환경 변수 규칙

| 변수명 | 위치 | 용도 |
|--------|------|------|
| `NOTION_API_KEY` | `.env.local` | Notion Integration API 키 |
| `NOTION_DATABASE_ID` | `.env.local` | Notion 데이터베이스 ID |
| `REVALIDATE_SECRET` | `.env.local` | ISR 재검증 API 인증 토큰 (단계 4) |

- `lib/notion.ts`의 `DATABASE_ID`는 `process.env.NOTION_DATABASE_ID!` 사용
- 환경 변수 미설정 시 오류 대신 빈 배열 반환으로 안전 처리

---

## 미구현 파일 (우선순위 순)

다음 파일들은 아직 생성되지 않았으며, 구현 시 위 규칙을 반드시 준수할 것:

```
app/posts/[slug]/page.tsx        # 글 상세 페이지 (단계 3)
app/posts/[slug]/loading.tsx     # 글 상세 스켈레톤 (단계 3)
app/category/[name]/page.tsx     # 카테고리별 글 목록 (단계 4)
app/api/revalidate/route.ts      # ISR 즉시 갱신 API (단계 4)
app/sitemap.ts                   # sitemap.xml 자동 생성 (단계 4)
app/robots.ts                    # robots.txt 자동 생성 (단계 4)
next.config.ts                   # Notion CDN 이미지 도메인 추가 (단계 5)
```

### app/posts/[slug]/page.tsx 구현 시 필수 항목
```typescript
export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const posts = await getPosts()
    return posts.map((post) => ({ slug: post.slug }))
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  return { title: post?.title ?? "글을 찾을 수 없습니다" }
}
```

### app/category/[name]/page.tsx 구현 시 필수 항목
```typescript
export const revalidate = 3600
export const dynamicParams = false  // CATEGORIES 상수 기반 정적 경로만

export async function generateStaticParams() {
  return CATEGORIES.map((name) => ({ name: encodeURIComponent(name) }))
}
```

---

## ❌ 절대 금지 사항

- **`app/components/` 디렉토리 생성 금지** — 과거 쇼케이스 라우트 잔재, 이 프로젝트에서 제거됨
- **`lib/notion.ts` 외부에서 `@notionhq/client` import 금지** — 컴포넌트/페이지에서 직접 Notion Client 생성 금지
- **`CATEGORIES` 상수 무시하고 카테고리 문자열 하드코딩 금지** — 항상 `lib/constants.ts`의 `CATEGORIES` 참조
- **`export const revalidate` 없는 페이지 생성 금지** — ISR 미설정은 정적 캐시 문제 유발
- **`"use client"` 불필요한 컴포넌트에 추가 금지** — Server Component 이점 손실
- **`searchParams`를 await 없이 직접 접근 금지** — Next.js 16에서 런타임 오류 발생
- **Notion API 오류를 throw로 전파 금지** — 항상 빈 배열/null 반환으로 안전 처리
- **`components/ui/`에 직접 파일 생성 금지** — `npx shadcn@latest add`로만 추가
- **`any` 타입을 eslint 주석 없이 사용 금지** — `// eslint-disable-next-line @typescript-eslint/no-explicit-any` 선행 필수
