import Link from "next/link";

export function BackLink({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm"
    >
      返回
    </Link>
  );
}
