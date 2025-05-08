"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NavbarUser from "@/components/ui/Navbar/navbar-user";

const services = [
  { name: "Handphone", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format&fit=crop" },
  { name: "Laptop", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300&auto=format&fit=crop" },
  { name: "AC", image: "https://images.unsplash.com/photo-1631545308456-c4ba335f4824?q=80&w=300&auto=format&fit=crop" },
  { name: "Kipas", image: "https://images.unsplash.com/photo-1614977645540-7abd88ba8e56?q=80&w=300&auto=format&fit=crop" },
  { name: "Printer", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=300&auto=format&fit=crop" },
  { name: "TV", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=300&auto=format&fit=crop" },
];

const recentOrders = [
  { technician: "Teknisi A", date: "02/05/2025", color: "bg-[#FFCE63]" },
  { technician: "Teknisi B", date: "02/05/2025", color: "bg-[#0B409C]" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Navbar  */}
      <NavbarUser />

      {/* Hero Section */}
      {/* Services Section */}
      <section className="px-6 py-8">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {services.map((service) => (
            <Card key={service.name} className="flex-shrink-0 w-48 overflow-hidden">
              <div className="relative h-32">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-medium">{service.name}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      <section className="px-6 py-8">
        <h2 className="text-xl font-semibold text-[#10316B] mb-4">Recent order</h2>
        <div className="space-y-4">
          {recentOrders.map((order, index) => (
            <div
              key={index}
              className={`${order.color} text-white p-4 rounded-lg flex items-center justify-between`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                <div>
                  <h3 className="font-medium">{order.technician}</h3>
                  <p className="text-sm">order by : {order.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right mt-4">
          <Button variant="link" className="text-[#10316B]">
            See More
          </Button>
        </div>
      </section>

      {/* Stats and Reviews */}
      <section className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-[#10316B] text-white">
          <h3 className="text-lg font-medium mb-4">Your Total Order</h3>
          <p className="text-6xl font-bold">8</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium text-[#10316B] mb-4">
            Rating dan Ulasan By User
          </h3>
          <div className="space-y-4">
            <div className="h-16 bg-gray-100 rounded-lg"></div>
            <div className="h-16 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="text-right mt-4">
            <Button variant="link" className="text-[#10316B]">
              See More
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}