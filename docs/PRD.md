# PRD: 미국주식 정보 블로그

> **Product Requirements Document**
> 작성일: 2026-06-02
> 버전: 1.0.0

---

## 1. 프로젝트 개요

### 1.1 프로젝트명

**미국주식 정보 블로그** (US Stock Info Blog)

### 1.2 목적

Notion을 CMS(콘텐츠 관리 시스템)로 활용하여 매일의 미국주식 주요 정보를 독자들이 쉽게 확인할 수 있는 블로그 서비스를 구축한다.

### 1.3 CMS로 Notion을 선택한 이유

| 이유 | 설명 |
|------|------|
| **편집 편의성** | 별도 CMS 어드민 없이 Notion에서 바로 글 작성 가능 |
| **자동 반영** | Notion에 글을 작성하면 블로그에 자동으로 반영됨 |
| **협업** | 팀원과 Notion으로 콘텐츠 공동 편집 가능 |
| **구조화** | Notion 데이터베이스로 글 메타데이터를 체계적으로 관리 |
| **비용** | 별도 CMS 서버 운영 비용 없음 |

### 1.4 기대 효과

- 콘텐츠 작성자가 개발 지식 없이도 손쉽게 글을 게시할 수 있음
- 미국주식에 관심 있는 독자들에게 매일 정리된 핵심 정보를 제공
- Notion의 강력한 편집 기능을 그대로 활용하여 콘텐츠 품질 향상

---

## 2. 기술 스택

### 2.1 핵심 기술

| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **Frontend** | Next.js | 15.x | App Router, SSR/SSG |
| **Language** | TypeScript | ^5 | 타입 안전성 |
| **CMS** | Notion API | `@notionhq/client` | 콘텐츠 데이터 소스 |
| **Styling** | Tailwind CSS | ^4 | 유틸리티 CSS |
| **UI** | shadcn/ui | latest | 컴포넌트 라이브러리 |
| **Icons** | Lucide React | latest | 아이콘 |
| **Deployment** | Vercel | - | 호스팅 및 CI/CD |

### 2.2 아키텍처 개요

```
[Notion 데이터베이스]
        ↓ Notion API (@notionhq/client)
[Next.js Server Components]
        ↓ ISR / SSG (revalidate)
[사용자 브라우저]
```

- **데이터 흐름**: Notion API → Next.js Server Component → 클라이언트 렌더링
- **캐싱 전략**: ISR(Incremental Static Regeneration)로 빌드 성능과 최신성 균형 유지
- **렌더링**: Server Components 기본, 인터랙션이 필요한 부분만 `"use client"` 적용

---

## 3. Notion 데이터베이스 구조

### 3.1 데이터베이스 스키마

| 필드명 | Notion 속성 타입 | 설명 | 비고 |
|--------|-----------------|------|------|
| `Title` | `title` | 글 제목 | 필수 |
| `Category` | `select` | 카테고리 분류 | 필수 |
| `Tags` | `multi_select` | 태그 목록 | 선택 |
| `Published` | `date` | 발행일 | 필수 |
| `Status` | `select` | 상태 (초안 / 발행됨) | 필수 |
| `Content` | page content | 본문 내용 | Notion 블록 |

### 3.2 카테고리 목록 (예시)

- 시장 동향
- 종목 분석
- 경제 지표
- ETF 정보
- 실적 발표
- 투자 전략

### 3.3 Status 값

| 값 | 설명 |
|----|------|
| `초안` | 작성 중, 블로그에 미노출 |
| `발행됨` | 완성, 블로그에 노출 |

### 3.4 데이터 필터링 규칙

- `Status === "발행됨"` 인 글만 블로그에 표시
- `Published` 날짜 기준 최신순 정렬

---

## 4. 주요 기능

### 4.1 기능 목록

| 기능 | 우선순위 | MVP 포함 | 설명 |
|------|---------|---------|------|
| Notion API 연동 | 🔴 높음 | ✅ | 글 목록 및 본문 데이터 조회 |
| 글 목록 페이지 | 🔴 높음 | ✅ | 최근 발행 글 목록 표시 |
| 글 상세 페이지 | 🔴 높음 | ✅ | 개별 글 Notion 블록 렌더링 |
| 카테고리 필터링 | 🟡 중간 | ✅ | 카테고리별 글 목록 필터 |
| 검색 기능 | 🟡 중간 | ✅ | 제목/태그 기반 검색 |
| 반응형 디자인 | 🔴 높음 | ✅ | 모바일/태블릿/데스크톱 대응 |
| 다크모드 | 🟢 낮음 | ❌ | 향후 추가 |
| RSS 피드 | 🟢 낮음 | ❌ | 향후 추가 |
| 댓글 기능 | 🟢 낮음 | ❌ | 향후 추가 |

### 4.2 기능 상세 설명

#### 4.2.1 Notion 데이터베이스에서 블로그 글 목록 가져오기

- Notion API의 `databases.query` 엔드포인트로 글 목록 조회
- `Status === "발행됨"` 필터 적용
- `Published` 날짜 기준 내림차순 정렬
- ISR 캐싱 적용 (revalidate: 3600초)

#### 4.2.2 개별 글 상세 페이지 표시

- Notion API의 `blocks.children.list` 엔드포인트로 본문 블록 조회
- Notion 블록 타입(paragraph, heading, bulleted_list, image 등)을 HTML로 렌더링
- `generateStaticParams()`로 빌드 시 정적 경로 생성

#### 4.2.3 카테고리별 필터링

- 글 목록 페이지에서 카테고리 탭/버튼으로 필터링
- URL 파라미터(`?category=시장동향`)로 상태 관리
- Notion API 쿼리 필터에 카테고리 조건 추가

#### 4.2.4 검색 기능

- 제목 및 태그 기반 클라이언트 사이드 검색
- 검색어 입력 시 실시간 필터링 (debounce 적용)

#### 4.2.5 반응형 디자인

- 모바일(< 768px), 태블릿(768px ~ 1024px), 데스크톱(> 1024px) 지원
- Tailwind CSS 반응형 유틸리티 클래스 활용

---

## 5. 화면 구성 (페이지 설계)

### 5.1 페이지 목록

| 경로 | 컴포넌트 | 설명 |
|------|---------|------|
| `/` | `app/page.tsx` | 홈 - 최근 글 목록 |
| `/posts/[slug]` | `app/posts/[slug]/page.tsx` | 글 상세 페이지 |
| `/category/[name]` | `app/category/[name]/page.tsx` | 카테고리별 글 목록 |

### 5.2 홈 페이지 (`/`)

```
┌─────────────────────────────────────────┐
│  Header (로고 + 네비게이션)               │
├─────────────────────────────────────────┤
│  Hero Section                            │
│  "미국주식 핵심 정보를 매일 전달합니다"    │
├─────────────────────────────────────────┤
│  [전체] [시장동향] [종목분석] [ETF] ...   │  ← 카테고리 필터
│  [검색창]                                │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 글 카드  │ │ 글 카드  │ │ 글 카드  │ │  ← 글 목록 (그리드)
│  │ 제목     │ │ 제목     │ │ 제목     │ │
│  │ 카테고리 │ │ 카테고리 │ │ 카테고리 │ │
│  │ 날짜     │ │ 날짜     │ │ 날짜     │ │
│  └──────────┘ └──────────┘ └──────────┘ │
├─────────────────────────────────────────┤
│  Footer                                  │
└─────────────────────────────────────────┘
```

### 5.3 글 상세 페이지 (`/posts/[slug]`)

```
┌─────────────────────────────────────────┐
│  Header                                  │
├─────────────────────────────────────────┤
│  ← 목록으로 돌아가기                      │
│                                          │
│  [카테고리 뱃지]                          │
│  # 글 제목                               │
│  📅 2026-06-02  🏷️ 태그1 태그2           │
│  ─────────────────────────────────────  │
│                                          │
│  본문 내용 (Notion 블록 렌더링)           │
│  ...                                     │
│                                          │
├─────────────────────────────────────────┤
│  이전 글 / 다음 글 네비게이션             │
├─────────────────────────────────────────┤
│  Footer                                  │
└─────────────────────────────────────────┘
```

### 5.4 카테고리 페이지 (`/category/[name]`)

```
┌─────────────────────────────────────────┐
│  Header                                  │
├─────────────────────────────────────────┤
│  ## 카테고리: 시장 동향                   │
│  총 12개의 글                             │
├─────────────────────────────────────────┤
│  글 목록 (홈과 동일한 카드 레이아웃)       │
├─────────────────────────────────────────┤
│  Footer                                  │
└─────────────────────────────────────────┘
```

---

## 6. 프로젝트 파일 구조 (예상)

```
notion-cms-project/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── page.tsx                      # 홈 페이지 (글 목록)
│   ├── posts/
│   │   └── [slug]/
│   │       ├── page.tsx              # 글 상세 페이지
│   │       └── loading.tsx           # 로딩 UI
│   ├── category/
│   │   └── [name]/
│   │       └── page.tsx              # 카테고리별 글 목록
│   └── api/
│       └── revalidate/
│           └── route.ts              # ISR 재검증 API (웹훅용)
├── components/
│   ├── layout/
│   │   ├── header.tsx                # 헤더 컴포넌트
│   │   └── footer.tsx                # 푸터 컴포넌트
│   ├── blog/
│   │   ├── post-card.tsx             # 글 카드 컴포넌트
│   │   ├── post-list.tsx             # 글 목록 컴포넌트
│   │   ├── post-content.tsx          # 글 본문 렌더러
│   │   └── category-filter.tsx       # 카테고리 필터 컴포넌트
│   └── ui/                           # shadcn/ui 컴포넌트
├── lib/
│   ├── notion.ts                     # Notion API 클라이언트 및 함수
│   ├── constants.ts                  # 사이트 설정, 카테고리 목록 등
│   └── utils.ts                      # 유틸리티 함수 (cn 등)
├── types/
│   └── index.ts                      # Post, Category 등 타입 정의
├── .env.example                      # 환경 변수 예시
└── docs/
    └── PRD.md                        # 본 문서
```

---

## 7. 환경 변수

```bash
# .env.local
NOTION_API_KEY=secret_xxxxxxxxxxxx       # Notion Integration API 키
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxx  # Notion 데이터베이스 ID
```

---

## 8. 구현 단계 (로드맵)

### Phase 1: 기반 설정 (1단계)

- [ ] `@notionhq/client` 패키지 설치
- [ ] Notion Integration 생성 및 API 키 발급
- [ ] Notion 데이터베이스 생성 및 스키마 설정
- [ ] 데이터베이스를 Integration에 공유
- [ ] `.env.local`에 환경 변수 설정
- [ ] `lib/notion.ts` — Notion 클라이언트 초기화 및 기본 함수 작성

### Phase 2: 글 목록 페이지 구현 (2단계)

- [ ] `types/index.ts` — `Post`, `Category` 타입 정의
- [ ] `lib/notion.ts` — `getPosts()`, `getCategories()` 함수 구현
- [ ] `components/blog/post-card.tsx` — 글 카드 컴포넌트
- [ ] `components/blog/post-list.tsx` — 글 목록 컴포넌트
- [ ] `components/blog/category-filter.tsx` — 카테고리 필터
- [ ] `app/page.tsx` — 홈 페이지 조립

### Phase 3: 글 상세 페이지 구현 (3단계)

- [ ] `lib/notion.ts` — `getPost()`, `getPostBlocks()` 함수 구현
- [ ] `components/blog/post-content.tsx` — Notion 블록 렌더러
- [ ] `app/posts/[slug]/page.tsx` — 상세 페이지 구현
- [ ] `generateStaticParams()` 설정으로 정적 경로 생성

### Phase 4: 카테고리 페이지 구현 (4단계)

- [ ] `app/category/[name]/page.tsx` — 카테고리 페이지 구현
- [ ] 카테고리별 Notion API 필터 쿼리 적용
- [ ] `generateStaticParams()` 설정

### Phase 5: 스타일링 및 최적화 (5단계)

- [ ] 반응형 레이아웃 마무리
- [ ] 로딩/에러/404 UI 처리
- [ ] ISR revalidate 설정 (`next.revalidate`)
- [ ] SEO 메타데이터 설정 (`generateMetadata()`)
- [ ] Vercel 배포 설정

---

## 9. 성능 및 SEO 고려사항

### 9.1 성능 전략

| 전략 | 설명 |
|------|------|
| **ISR** | 글 목록/상세 페이지에 `revalidate: 3600` 적용 (1시간마다 재생성) |
| **정적 생성** | `generateStaticParams()`로 빌드 시 자주 읽히는 페이지 사전 렌더링 |
| **이미지 최적화** | `next/image`로 Notion 내 이미지 최적화 |
| **API 호출 최소화** | 동일 페이지 내 중복 API 호출 방지 |

### 9.2 SEO 전략

| 항목 | 구현 방법 |
|------|---------|
| **페이지 타이틀** | `generateMetadata()`로 글 제목 기반 동적 타이틀 생성 |
| **메타 설명** | 글 요약 또는 첫 단락 텍스트 활용 |
| **OG 태그** | Open Graph 태그로 소셜 공유 미리보기 지원 |
| **시맨틱 HTML** | `<article>`, `<h1>~<h3>` 등 시맨틱 태그 사용 |

---

## 10. MVP 범위 요약

MVP(Minimum Viable Product)에 포함되는 핵심 기능:

- ✅ Notion API 연동 (`@notionhq/client`)
- ✅ 글 목록 페이지 (홈)
- ✅ 글 상세 페이지 (Notion 블록 렌더링)
- ✅ 카테고리 필터링
- ✅ 검색 기능 (제목/태그 기반)
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)
- ✅ Vercel 배포

MVP에서 제외되는 기능 (향후 추가):

- ❌ 다크모드
- ❌ RSS 피드
- ❌ 댓글 기능
- ❌ 뉴스레터 구독
- ❌ 관련 글 추천

---

## 11. 참고 자료

- [Notion API 공식 문서](https://developers.notion.com/)
- [@notionhq/client npm 패키지](https://www.npmjs.com/package/@notionhq/client)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)
