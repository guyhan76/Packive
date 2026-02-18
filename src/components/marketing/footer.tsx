"use client"

// Footer 섹션 - 로고, 슬로건, 링크, 소셜
import { Logo } from "@/components/shared/logo"
import Link from "next/link"
import { useI18n } from "@/components/i18n-context";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 로고 & 슬로건 */}
          <div className="md:col-span-2">
            <Logo size="sm" />
            <p className="mt-3 text-sm text-gray-500 max-w-xs">
              {t("m.foot.slogan")}
            </p>
          </div>

          {/* 네비게이션 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              {t("m.foot.product")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {t("m.features")}
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {t("m.pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href="#early-access"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {t("m.getEarlyAccess")}
                </Link>
              </li>
            </ul>
          </div>

          {/* 소셜 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              {t("m.foot.connect")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            {t("m.foot.copyright")}
          </p>
        </div>
      </div>
    </footer>
  )
}
