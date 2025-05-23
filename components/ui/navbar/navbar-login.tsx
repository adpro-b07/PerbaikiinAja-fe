import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

export default function NavbarLogin() {
    return (
        <>
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
            <div className="flex items-center gap-2">
            <Wrench className="w-8 h-8 text-[#0B409C]" />
            <span className="text-xl font-bold text-[#0B409C]">PerbaikiinAja</span>
            </div>
            <div className="flex items-center gap-6">
            <Button className="bg-[#10316B] text-white hover:bg-[#0B409C]">
                Login
            </Button>
            </div>
            </nav>
        </>
    );
}

