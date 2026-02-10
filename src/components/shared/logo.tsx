import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
}

export function Logo({ size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  }

  return (
    <Link href="/" className={`font-bold tracking-tight ${sizeClasses[size]}`}>
      <span className="text-blue-600">Pack</span>
      <span className="text-gray-900">ive</span>
    </Link>
  )
}
