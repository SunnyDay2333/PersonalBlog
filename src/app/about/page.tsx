// ============================================================
// 关于页（C 端）
// 个人介绍 + 技能 + 兴趣爱好 + 联系方式
// ============================================================

import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { AboutContent } from "./about-content";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "关于",
  description: `关于我 —— ${SITE_NAME} 的个人介绍与联系方式`,
};

export default function AboutPage() {
  return (
    <>
      <PublicHeader />

      <main className="flex-1">
        <AboutContent />
      </main>

      <PublicFooter />
    </>
  );
}
