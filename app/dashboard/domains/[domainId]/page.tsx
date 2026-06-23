import { DomainDetailClient } from "./domain-detail-client";

type DomainDetailPageProps = {
  params: Promise<{
    domainId: string;
  }>;
};

export default async function DomainDetailPage({ params }: DomainDetailPageProps) {
  const { domainId } = await params;

  return <DomainDetailClient domainId={domainId} />;
}
