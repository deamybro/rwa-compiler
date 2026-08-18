import type { Metadata } from "next";
import { AssetView } from "../../components/RWAViews";

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  const { symbol } = await params;
  const title = `${symbol} RWA Passport — RWA Compiler`;
  const description = `Live ${symbol} identity, backing, multiplier, corporate-action state and deterministic preflight policy.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [] },
    twitter: { title, description, images: [] },
  };
}

export default async function AssetPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return <AssetView symbol={symbol} />;
}

