"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import NavbarTeknisi from "@/components/ui/navbar/navbar-teknisi";
import { Button } from "@/components/ui/button";

const incomingOrders = [
    { title: "Request HP A", description: "........." },
    { title: "Request HP B", description: "........." },
    { title: "Request HP C", description: "........." },
];

const recentOrders = [
  { technician: "Teknisi A", date: "02/05/2025", color: "bg-[#FFCE63]" },
  { technician: "Teknisi B", date: "02/05/2025", color: "bg-[#0B409C]" },
];

export default function Teknisi() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <NavbarTeknisi />

        {/* Incoming Orders */}
        <section className="px-6 py-8">
        <h2 className="text-xl font-semibold text-[#10316B] mb-4">
            Hi, Teknisi A! Berikut orderan yang masuk
        </h2>
        <div className="flex items-center space-x-4 overflow-x-auto">
            {incomingOrders.map((order, index) => (
            <div
                key={index}
                className="min-w-[250px] border-2 rounded-2xl p-4 flex-shrink-0"
            >
                <p className="text-lg font-medium mb-2">{order.title}</p>
                <p>Deskripsi : {order.description}</p>
                <button className="mt-4 w-full py-2 border-2 rounded-xl text-sm font-medium hover:bg-gray-100">
                Lihat detail
                </button>
            </div>
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