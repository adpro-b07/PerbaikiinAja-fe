import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NavbarLogin from "@/components/ui/navbar/navbar-login";

export default function Login() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <NavbarLogin />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen bg-[#10316B] text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to PerbaikiinAja</h1>
        <p className="text-lg mb-8">Your one-stop solution for all repairs</p>
        <Link href="/login" className="bg-white text-[#10316B] px-6 py-3 rounded-lg">
          Get Started
        </Link>
      </section>
    </main>
  );
}