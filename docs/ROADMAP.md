# 🗺️ 미국주식 정보 블로그 개발 로드맵

> 마지막 업데이트: 2026-06-03 | 버전: 1.1

---

## 📋 프로젝트 개요

### 비전

Notion을 CMS로 활용하여 개발 지식 없이도 매일 미국주식 핵심 정보를 발행하고, 독자에게 빠르게 전달하는 블로그 서비스

### 목표

- Notion 데이터베이스 하나로 콘텐츠 작성·발행·관리 전 과정을 처리한다
- 독자가 카테고리/검색으로 원하는 정보를 빠르게 찾을 수 있게 한다
- 별도 서버 없이 Vercel + ISR로 성능과 최신성을 모두 확보한다

### 성공 지표 (KPI)

| 지표 | 목표값 | 측정 방법 |
|------|--------|----------|
| 홈 페이지 LCP | 2.5초 이하 | Vercel Analytics / Lighthouse |
| Notion → 블로그 반영 시간 | 1시간 이내 | ISR revalidate 설정 확인 |
| 모바일 Lighthouse 성능 점수 | 90점 이상 | Lighthouse CI |
| 빌드 오류 | 0건 | Vercel 배포 로그 |

---

## 🎯 MVP 범위

### MVP 포함 기능

- [x] Notion API 연동 (`@notionhq/client`)
- [x] 글 목록 페이지 (홈 — 카테고리 필터 + 검색)
- [ ] 글 상세 페이지 (Notion 블록 렌더링)
- [ ] 카테고리 전용 페이지 (`/category/[name]`)
- [ ] ISR 재검증 API 엔드포인트
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] Vercel 배포

### MVP 제외 기능 (단계 5 이후 추가)

- 다크모드
- RSS 피드
- 댓글 기능
- 뉴스레터 구독
- 관련 글 추천

---

## 📅 개발 단계

### 단계 1: 프로젝트 골격 — ✅ 완료

**목표:** 프로젝트 구조 정리, 타입 체계 확립, 외부 서비스 연결 준비

#### 프로젝트 구조 정리

- [x] 스타터킷 불필요 파일 제거 (`components/sections/`, `components/showcase/`, `app/components/`)
- [x] `@notionhq/client` 패키지 설치
- [x] `.env.example` — 필요한 환경 변수 문서화

#### 타입 및 스키마 정의

- [x] `types/index.ts` — `Post`, `Category`, `NotionBlock`, `NavItem`, `SiteConfig` 타입 정의

#### 외부 서비스 설정 (수동 작업)

- [ ] Notion Integration 생성 및 API 키 발급
- [ ] Notion 데이터베이스 생성 및 스키마 설정 (`Title`, `Category`, `Tags`, `Published`, `Status`)
- [ ] 데이터베이스를 Integration에 공유
- [ ] `.env.local`에 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 설정

**완료 기준:**
- TypeScript 컴파일 오류 0건
- `npm run dev` 정상 실행

---

### 단계 2: 공통 모듈 — ✅ 완료

**목표:** 모든 페이지와 기능에서 공통으로 사용하는 레이어 구축

#### 설정 및 유틸리티

- [x] `lib/constants.ts` — `SITE_CONFIG`, `NAV_ITEMS`, `CATEGORIES`, `ISR_REVALIDATE` 정의
- [x] `lib/validations.ts` — `searchSchema`, `SearchValues` 정의
- [x] `lib/utils.ts` — `cn()` 클래스 병합 헬퍼

#### 데이터 접근 레이어

- [x] `lib/notion.ts` — Notion 클라이언트 초기화
  - [x] `getPosts(category?)` — 발행된 글 목록 조회 (카테고리 필터 선택)
  - [x] `getPost(slug)` — 슬러그 기반 단일 글 조회
  - [x] `getPostBlocks(pageId)` — 글 본문 블록 목록 조회
  - [x] `getCategories()` — 카테고리별 글 수 집계
  - [x] 환경 변수 미설정 시 빈 배열 반환 (에러 처리)

#### 레이아웃 컴포넌트

- [x] `components/layout/header.tsx` — 사이트명, 네비게이션, 반응형 메뉴
- [x] `components/layout/footer.tsx` — 사이트명, 설명, 저작권
- [x] `app/layout.tsx` — 루트 레이아웃 (Providers, Geist 폰트, 메타데이터)

**완료 기준:**
- Notion API 함수 호출 시 에러 없이 빈 배열 또는 정상 데이터 반환
- 레이아웃 컴포넌트 렌더링 오류 0건

---

### 단계 3: 핵심 기능 — 🔄 진행 중

**목표:** 독자가 글을 탐색하고 읽는 핵심 흐름 완성

#### 글 목록 페이지 — ✅ 완료

- [x] `components/blog/post-card.tsx` — 제목, 카테고리 배지, 날짜, 태그, 발췌문
- [x] `components/blog/post-list.tsx` — 반응형 그리드 (모바일 1열 → 데스크톱 3열)
- [x] `components/blog/category-filter.tsx` — URL `?category=` 파라미터 연동 탭 필터
- [x] `components/blog/search-input.tsx` — 제목/태그 검색 (debounce 300ms)
- [x] `app/page.tsx` — 홈 페이지 조립, ISR `revalidate: 3600` 적용

#### 글 상세 페이지 — 🔲 진행 예정 | 예상 기간: 3~4일

- [ ] `components/blog/post-content.tsx` — Notion 블록 렌더러
  - 지원 블록: `paragraph`, `heading_1/2/3`, `bulleted_list_item`, `numbered_list_item`, `quote`, `code`, `image`, `divider`
  - 미지원 블록은 안전하게 무시 처리
- [ ] `app/posts/[slug]/page.tsx` — 글 상세 페이지
  - 카테고리 배지, 제목, 날짜, 태그 메타 헤더
  - 이전 글/다음 글 네비게이션
  - `generateStaticParams()` — 빌드 시 발행된 글 경로 정적 생성
  - `generateMetadata()` — 글 제목 기반 동적 title, OG 태그
  - ISR `revalidate: 3600` 적용
- [ ] `app/posts/[slug]/loading.tsx` — 스켈레톤 로딩 UI

**완료 기준:**
- `/posts/[slug]` 경로에서 Notion 본문 블록이 정상 렌더링됨
- 존재하지 않는 슬러그 접근 시 404 페이지 표시
- `generateStaticParams()`로 빌드 시 모든 발행 글 경로 생성

**리스크:**

| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|----------|
| Notion 이미지 URL 1시간 만료 | 높음 | 중간 | `next/image` `unoptimized` 옵션 또는 프록시 구현 |
| 미지원 블록 타입으로 렌더링 오류 | 중간 | 낮음 | `default` 케이스로 `null` 반환, 에러 바운더리 적용 |
| 블록 수 100개 초과 글 | 낮음 | 중간 | `has_more` 체크 후 재귀 조회로 전체 블록 수집 |

---

### 단계 4: 추가 기능 — 🔲 진행 예정 | 예상 기간: 2~3일

**목표:** 탐색 편의성 향상 및 콘텐츠 자동 갱신 체계 완성

#### 카테고리 전용 페이지

- [ ] `app/category/[name]/page.tsx` — 카테고리별 글 목록
  - 카테고리명 + 글 수 헤더
  - `getPosts(category)` 호출 후 `PostList` 컴포넌트 재사용
  - `generateStaticParams()` — `CATEGORIES` 상수 기반 정적 경로 생성
  - `generateMetadata()` — 카테고리명 기반 동적 메타데이터
  - ISR `revalidate: 3600` 적용
  - 존재하지 않는 카테고리 접근 시 `notFound()` 처리

#### ISR 재검증 API

- [ ] `app/api/revalidate/route.ts` — Notion 웹훅 수신 시 캐시 즉시 갱신
  - `REVALIDATE_SECRET` 환경 변수로 인증
  - `revalidatePath('/', 'layout')` 호출로 전체 페이지 재검증

#### SEO 보강

- [ ] `app/robots.ts` — robots.txt 자동 생성
- [ ] `app/sitemap.ts` — 발행된 글 기반 sitemap.xml 자동 생성

**완료 기준:**
- `/category/시장동향` 접근 시 해당 카테고리 글만 표시
- 재검증 API 호출 시 1분 이내 최신 글이 반영됨
- sitemap.xml에 발행된 모든 글 URL 포함

---

### 단계 5: 최적화 및 배포 — 🔲 진행 예정 | 예상 기간: 3~4일

**목표:** 성능 기준 달성, 반응형 완성, 프로덕션 배포

#### 성능 최적화

- [ ] `next.config.ts` — `next/image` 허용 도메인 추가 (Notion CDN: `s3.us-west-2.amazonaws.com` 등)
- [ ] Notion API 중복 호출 방지 확인 (동일 요청 내 캐싱)
- [ ] `app/posts/[slug]/page.tsx` — `generateStaticParams()` 오류 시 빈 배열 폴백 + `dynamicParams: true` 설정

#### UI/UX 마무리

- [ ] 전 페이지 반응형 점검 (모바일 375px, 태블릿 768px, 데스크톱 1280px)
- [ ] 에러 페이지 (`app/error.tsx`) UI 점검
- [ ] 404 페이지 (`app/not-found.tsx`) UI 점검
- [ ] 로딩 UI (`app/loading.tsx`) 점검

#### 배포

- [ ] Vercel 프로젝트 연결
- [ ] Vercel 환경 변수 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`, `REVALIDATE_SECRET`)
- [ ] `npm run build` 성공 확인 (타입 오류, ESLint 경고 0건)
- [ ] 프로덕션 URL에서 전 페이지 동작 검증

**완료 기준:**
- Lighthouse 모바일 성능 점수 90점 이상
- `npm run build` 경고 0건
- Vercel 배포 성공 및 프로덕션 URL 정상 동작
- OG 태그 소셜 미리보기 정상 출력

**리스크:**

| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|----------|
| Vercel 환경 변수 누락으로 배포 실패 | 중간 | 높음 | `.env.example` 기반 사전 점검 체크리스트 활용 |
| Notion 이미지 도메인 `next/image` 차단 | 높음 | 중간 | `next.config.ts`에 Notion CDN 도메인 추가 |
| `generateStaticParams()` API 타임아웃 | 낮음 | 높음 | 빈 배열 폴백 + `dynamicParams: true` 설정 |

---

### 단계 6: 기능 확장 — ⏳ 향후 계획

> MVP 배포 이후 필요에 따라 순서를 조정하여 진행

- [ ] 다크모드 지원 (`next-themes` 활용)
- [ ] RSS 피드 생성 (`app/feed.xml/route.ts`)
- [ ] 댓글 기능 (Giscus 또는 Utterances 연동)
- [ ] 뉴스레터 구독 (이메일 수집 폼)
- [ ] 관련 글 추천 (동일 카테고리/태그 기반)
- [ ] 글 조회수 추적 (Vercel KV 또는 외부 서비스)
- [ ] 이미지 OG 자동 생성 (`@vercel/og`)

---

## 📊 전체 일정 요약

```
2026-06
Week 1  ████████████████ 단계 1 (완료) + 단계 2 (완료)
Week 2  ████████████████ 단계 3 — 핵심 기능 (글 상세 페이지)
Week 3  ████████████████ 단계 4 — 추가 기능 (카테고리, ISR API, SEO)
Week 4  ████████████████ 단계 5 — 최적화 및 Vercel 배포
```

| 단계 | 예상 기간 | 주요 목표 | 상태 |
|------|----------|-----------|------|
| 단계 1 — 프로젝트 골격 | 완료 | 구조 정리, 타입 정의, 환경 설정 | ✅ 완료 |
| 단계 2 — 공통 모듈 | 완료 | 상수, Notion API 함수, 레이아웃 | ✅ 완료 |
| 단계 3 — 핵심 기능 | 3~4일 | 글 목록·상세 페이지 | 🔄 진행 중 |
| 단계 4 — 추가 기능 | 2~3일 | 카테고리 페이지, ISR API, SEO | 🔲 진행 예정 |
| 단계 5 — 최적화·배포 | 3~4일 | 성능 최적화, Vercel 배포 | 🔲 진행 예정 |
| 단계 6 — 기능 확장 | 미정 | 다크모드, RSS, 댓글 등 | ⏳ 향후 계획 |

---

## 🏗️ 기술 아키텍처 결정사항

### 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|----------|
| 프레임워크 | Next.js 15 (App Router) | 서버 컴포넌트 + ISR로 SEO와 성능 동시 확보 |
| 언어 | TypeScript 5 (strict 모드) | 타입 안전성, 리팩터링 용이성 |
| CMS | Notion API (`@notionhq/client`) | 별도 CMS 서버 없이 Notion에서 직접 콘텐츠 관리 |
| 스타일링 | Tailwind CSS v4 | 유틸리티 클래스로 빠른 반응형 구현 |
| UI 컴포넌트 | shadcn/ui (Radix Nova 스타일) | 접근성 보장된 Radix 기반 컴포넌트 |
| 배포 | Vercel | Next.js 최적화 배포 환경 + ISR 네이티브 지원 |

### 주요 아키텍처 결정 (ADR)

1. **ISR 채택**: 새 글 발행 시 전체 재빌드 없이 `revalidate: 3600`으로 자동 갱신. 글이 많아져도 빌드 시간 증가 없음
2. **슬러그 생성 전략**: Notion에 별도 `Slug` 속성이 있으면 사용, 없으면 제목 기반 자동 생성. 한글 지원 포함
3. **검색을 서버 사이드 필터링으로 처리**: Notion API가 전문 검색을 지원하지 않으므로, 서버에서 전체 목록을 받아 필터링. 글 수가 적은 초기 단계에 적합
4. **카테고리 필터를 URL 파라미터(`?category=`)로 관리**: 뒤로가기·공유·북마크 시 상태 유지, SEO 친화적
5. **`"use client"` 최소화**: `CategoryFilter`, `SearchInput` 등 인터랙션이 필요한 컴포넌트에만 적용

---

## ✅ 검증 계획

### 빌드 검증

- [ ] `npm run build` — 타입 오류, ESLint 경고 0건
- [ ] `npm run lint` — ESLint 규칙 위반 0건

### 기능 검증 (Playwright)

**글 목록 페이지 (`/`)**
- [ ] 글 카드 목록 렌더링 정상
- [ ] 카테고리 탭 클릭 시 URL 파라미터 변경 및 필터링 동작
- [ ] 검색어 입력 시 제목/태그 기반 필터링 동작
- [ ] 글 카드 클릭 시 `/posts/[slug]`로 이동

**글 상세 페이지 (`/posts/[slug]`)**
- [ ] 제목, 카테고리 배지, 날짜, 태그 헤더 정상 출력
- [ ] Notion 블록 본문 렌더링 정상
- [ ] 존재하지 않는 슬러그 접근 시 404 표시

**카테고리 페이지 (`/category/[name]`)**
- [ ] 카테고리명, 글 수 정상 표시
- [ ] 해당 카테고리 글만 필터링되어 표시
- [ ] 존재하지 않는 카테고리 접근 시 404 표시

**반응형**
- [ ] 모바일(375px) 레이아웃 깨짐 없음
- [ ] 태블릿(768px) 레이아웃 정상
- [ ] 헤더 네비게이션 전 링크 동작

---

## ⚠️ 리스크 관리

| # | 리스크 | 확률 | 영향 | 우선순위 | 대응 전략 |
|---|--------|------|------|----------|----------|
| 1 | Notion 이미지 URL 1시간 만료 | 높음 | 중간 | P1 | 단계 3에서 `next/image` 도메인 설정 + 만료 처리 확인 |
| 2 | Notion API Rate Limit (초당 3회) | 중간 | 중간 | P2 | 빌드 시 호출 최소화, 병렬 처리 제한 |
| 3 | 환경 변수 누락으로 배포 실패 | 중간 | 높음 | P1 | `.env.example` 체크리스트 기반 사전 점검 |
| 4 | `generateStaticParams()` API 타임아웃 | 낮음 | 높음 | P2 | 빈 배열 폴백 + `dynamicParams: true` |
| 5 | 검색 성능 저하 (글 수 증가 시) | 낮음 | 낮음 | P3 | 글 500건 초과 시 서버 사이드 검색 또는 Algolia 도입 검토 |

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.1 | 2026-06-03 | 기능 중심 구조 → 개발 순서 기반 구조로 재편 (골격 → 공통 모듈 → 핵심 기능 → 추가 기능 → 최적화·배포) |
| 1.0 | 2026-06-03 | 최초 작성 (PRD v1.0.0 기반) |
