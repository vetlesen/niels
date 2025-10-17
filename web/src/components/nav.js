import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex justify-between px-4 pt-2">
        <Link href={'/'}>Niels Windfeldt</Link>
        <Link href={'/'}>About</Link>
    </nav>
  );
}
