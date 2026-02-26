// ============================================================================
// VietBridge AI — Product Landing Page
// Single-page marketing site with responsive PC + H5 layout
// ============================================================================

import type { Metadata } from "next";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import PainPointsSection from "@/components/landing/PainPointsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import DemoSection from "@/components/landing/DemoSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import FooterCTA from "@/components/landing/FooterCTA";

export const metadata: Metadata = {
  title: "VietBridge AI — 在越华人智能沟通助手",
  description:
    "AI驱动的中越沟通工具。智能翻译、回复建议、风险预警、文档扫描、越南语教学，专为在越南的中国人打造。",
  keywords: [
    "越南翻译",
    "中越翻译",
    "越南生活",
    "AI翻译",
    "岘港",
    "越南语学习",
    "VietBridge",
  ],
  openGraph: {
    title: "VietBridge AI — 在越华人智能沟通助手",
    description:
      "不是翻译工具，是你在越南的智能沟通伙伴。理解语境、懂得文化、预警风险。",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <HeroSection />
        <PainPointsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ComparisonSection />
        <DemoSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FooterCTA />
      </main>
    </div>
  );
}
