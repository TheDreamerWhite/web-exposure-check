import type { Metadata } from "next";
import { DemoReportClient } from "./demo-report-client";

export const metadata: Metadata = {
  title: "Demo Report",
  description:
    "Preview a business-friendly website security report for a fictional restaurant.",
};

export default function DemoReportPage() {
  return <DemoReportClient />;
}
