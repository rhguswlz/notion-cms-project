# 미국주식 인사이트

> Notion을 CMS로 활용하는 미국주식 정보 블로그

매일 업데이트되는 미국주식 핵심 정보를 Notion에서 작성하면 블로그에 자동으로 반영됩니다.

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **목적** | Notion CMS 기반 미국주식 정보 블로그 |
| **CMS** | Notion API (`@notionhq/client`) |
| **렌더링** | ISR — 1시간마다 자동 재검증 |
| **배포** | Vercel |

- 📄 [PRD 문서](./docs/PRD.md)
- 🗺️ [개발 로드맵](./docs/ROADMAP.md)

---

## 🛠 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.x |
| 언어 | TypeScript (strict 모드) | ^5 |
| CMS | Notion API | `@notionhq/client` |
| 스타일링 | Tailwind CSS | ^4 |
| UI 컴포넌트 | shadcn/ui | latest |
| 아이콘 | Lucide React | latest |
| 폼 검증 | React Hook Form + Zod | - |
| 배포 | Vercel | - |

---

## ✨ 주요 기능

- ✅ **글 목록 페이지** — 발행된 글을 최신순 그리드로 표시
- ✅ **카테고리 필터** — URL 파라미터 기반 (`?category=시장동향`)
- ✅ **제목/태그 검색** — 실시간 필터링 (debounce 적용)
- 🔲 **글 상세 페이지** — Notion 블록 렌더링 (`/posts/[slug]`)
- 🔲 **카테고리 전용 페이지** — (`/category/[name]`)
- 🔲 **ISR 재검증 API** — Notion 웹훅 연동으로 즉시 갱신
- 🔲 **SEO 최적화** — 동적 메타데이터, sitemap, robots.txt
- 🔲 **Vercel 배포**

---

## 📂 프로젝트 구조

```
notion-cms-project/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (Providers, 폰트, 메타데이터)
│   ├── page.tsx                      # 홈 — 글 목록, 카테고리 필터, 검색
│   ├── posts/[slug]/
│   │   ├── page.tsx                  # 글 상세 페이지
│   │   └── loading.tsx               # 스켈레톤 로딩 UI
│   ├── category/[name]/
│   │   └── page.tsx                  # 카테고리별 글 목록
│   ├── api/revalidate/
│   │   └── route.ts                  # ISR 재검증 웹훅 API
│   ├── globals.css                   # Tailwind v4 글로벌 스타일
│   ├── error.tsx                     # 에러 바운더리
│   ├── loading.tsx                   # 전역 로딩 UI
│   └── not-found.tsx                 # 404 페이지
├── components/
│   ├── blog/
│   │   ├── post-card.tsx             # 글 카드 (제목, 카테고리, 날짜, 태그)
│   │   ├── post-list.tsx             # 글 목록 그리드
│   │   ├── post-content.tsx          # Notion 블록 렌더러
│   │   ├── category-filter.tsx       # 카테고리 탭 필터 (클라이언트)
│   │   └── search-input.tsx          # 검색창 (클라이언트, debounce)
│   ├── layout/
│   │   ├── header.tsx                # 헤더 (네비게이션, 반응형 메뉴)
│   │   ├── footer.tsx                # 푸터
│   │   ├── page-container.tsx        # 페이지 콘텐츠 컨테이너
│   │   └── section.tsx               # 섹션 래퍼
│   └── ui/                           # shadcn/ui 컴포넌트
├── lib/
│   ├── notion.ts                     # Notion API 클라이언트 및 함수
│   ├── constants.ts                  # SITE_CONFIG, CATEGORIES, ISR_REVALIDATE
│   ├── validations.ts                # Zod 스키마 (searchSchema)
│   └── utils.ts                      # cn() 클래스 병합 헬퍼
├── types/
│   └── index.ts                      # Post, Category, NotionBlock 타입
├── hooks/
│   └── use-mobile.ts                 # useIsMobile() 훅
├── docs/
│   ├── PRD.md                        # 제품 요구사항 문서
│   └── ROADMAP.md                    # 개발 로드맵
└── .env.example                      # 환경 변수 예시
```

---

## ⚙️ 환경 변수 설정

`.env.example`을 참고하여 `.env.local` 파일을 생성하세요.

```bash
# Notion Integration API 키
NOTION_API_KEY=secret_xxxxxxxxxxxx

# Notion 데이터베이스 ID
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxx

# ISR 재검증 웹훅 시크릿 (선택)
REVALIDATE_SECRET=your_secret_here
```

---

## 🗄 Notion 데이터베이스 스키마

Notion에서 아래 속성을 가진 데이터베이스를 생성하세요.

| 속성명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| `Title` | `title` | 글 제목 | ✅ |
| `Category` | `select` | 카테고리 | ✅ |
| `Tags` | `multi_select` | 태그 목록 | - |
| `Published` | `date` | 발행일 | ✅ |
| `Status` | `select` | `초안` / `발행됨` | ✅ |

> **참고:** `Status`가 `발행됨`인 글만 블로그에 노출됩니다.

### 카테고리 목록

`시장 동향` · `종목 분석` · `경제 지표` · `ETF 정보` · `실적 발표` · `투자 전략`

---

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local에 NOTION_API_KEY, NOTION_DATABASE_ID 입력
```

### 3. Notion 연동

1. [Notion Integrations](https://www.notion.so/my-integrations)에서 Integration 생성
2. API 키를 `NOTION_API_KEY`에 설정
3. 데이터베이스를 Integration에 공유 (데이터베이스 우상단 `···` → `연결` → Integration 선택)
4. 데이터베이스 URL에서 ID 복사 → `NOTION_DATABASE_ID`에 설정

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

---

## 📋 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (hot reload) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드된 앱 실행 |
| `npm run lint` | ESLint 코드 검사 |

---

## 🌐 배포 (Vercel)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel
```

Vercel 대시보드에서 환경 변수를 설정하세요:
- `NOTION_API_KEY`
- `NOTION_DATABASE_ID`
- `REVALIDATE_SECRET`

---

## 📚 참고 자료

- [Notion API 공식 문서](https://developers.notion.com/)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com)
- [Vercel 배포 가이드](https://vercel.com/docs)
