import { Separator } from "@/components/ui/separator";
import { PageContainer } from "@/components/layout/page-container";
import { SITE_CONFIG } from "@/lib/constants";

// 블로그 푸터 컴포넌트 — 사이트명, 설명, 저작권 표시
export function Footer() {
  return (
    <footer className="bg-background">
      <Separator />
      <PageContainer>
        <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          {/* 사이트 설명 및 Notion CMS 안내 */}
          <div className="flex flex-col gap-1 text-center md:text-left">
            <p className="text-sm font-medium">{SITE_CONFIG.name}</p>
            <p className="text-xs text-muted-foreground">{SITE_CONFIG.description}</p>
          </div>

          {/* 저작권 및 Notion 안내 */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. Powered by Notion CMS.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
