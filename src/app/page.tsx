import { getSiteContent } from "@/lib/get-content";
import { ContentProvider } from "@/lib/content-context";
import { AppShell } from "@/components/AppShell";
import { SectionList } from "@/components/SectionList";

export default async function Page() {
  const content = await getSiteContent();
  return (
    <ContentProvider content={content}>
      <div className="grain">
        <AppShell>
          <SectionList />
        </AppShell>
      </div>
    </ContentProvider>
  );
}
