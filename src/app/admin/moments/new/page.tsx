// ============================================================
// 新建说说页（B 端）
// ============================================================

import type { Metadata } from "next";
import { MomentEditor } from "@/components/moments/moment-editor";
import { AuthGuard } from "@/components/admin/auth-guard";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `新建说说 | ${SITE_NAME}`,
};

export default function NewMomentPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-lg font-semibold">新建说说</h1>
        <MomentEditor />
      </div>
    </AuthGuard>
  );
}
