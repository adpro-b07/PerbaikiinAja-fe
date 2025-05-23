"use client";

import { useEffect, useState } from "react";

export default function OrderPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user?.email) return;
      try {
        const res = await fetch(`/api/pesanan/pengguna/${user.email}`, {
          credentials: "include",
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-[#10316B] mb-6">Your Orders</h1>
      <div className="bg-gray-100 rounded-lg p-6">
        {orders.length === 0 ? (
          <div className="text-gray-500 text-center">
            Order list will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#10316B] text-white">
                  <th className="px-4 py-2">Nama Barang</th>
                  <th className="px-4 py-2">Kondisi</th>
                  <th className="px-4 py-2">Harga</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Tgl Servis</th>
                  <th className="px-4 py-2">Tgl Selesai</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-4 py-2">{order.namaBarang}</td>
                    <td className="px-4 py-2">{order.kondisiBarang}</td>
                    <td className="px-4 py-2">
                      Rp{order.harga?.toLocaleString() || "-"}
                    </td>
                    <td className="px-4 py-2">{order.statusPesanan}</td>
                    <td className="px-4 py-2">{order.tanggalServis}</td>
                    <td className="px-4 py-2">{order.tanggalSelesai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
