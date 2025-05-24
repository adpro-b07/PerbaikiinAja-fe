import { Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NavbarTeknisi() {
  return (
    <>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Wrench className="w-8 h-8 text-[#0B409C]" />
          <span className="text-xl font-bold text-[#0B409C]">PerbaikiinAja</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[#10316B]">Home</Link>
          <Link href="/order" className="text-[#10316B]">Order</Link>
          <Button className="bg-[#10316B] text-white hover:bg-[#0B409C]">
            Hi, Teknisi!
          </Button>
        </div>
      </nav>
    </>
  );
}