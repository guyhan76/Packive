import { Logo } from "@/components/shared/logo"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-gray-500">© 2026 Packive. All rights reserved. | packive.design</p>
        </div>
      </div>
    </footer>
  )
}
