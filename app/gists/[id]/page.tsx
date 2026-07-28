"use client";

import { useParams } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";
import GistViewer from "../../components/gists/GistViewer";

export default function GistPage() {
  const params = useParams();
  const gistId = params.id as string;

  return (
    <MainLayout>
      <GistViewer gistId={gistId} />
    </MainLayout>
  );
}
