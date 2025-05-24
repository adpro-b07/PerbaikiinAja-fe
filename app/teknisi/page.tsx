"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import NavbarTeknisi from "@/components/ui/navbar/navbar-teknisi";
import { Button } from "@/components/ui/button";

interface Order {
  id: number;
  namaBarang: string;
  kondisiBarang: string;
  statusPesanan: string;
  date: string;
}

export default function Teknisi() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrder, setTotalOrder] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [laporan, setLaporan] = useState("");
  const [rating, setRating] = useState(0);

  // Fetch data
  const fetchOrders = () => {
    fetch(`/api/pesanan/teknisi/ani@mail.com`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setTotalOrder(data.filter((order: Order) => order.statusPesanan !== "Pesanan Dibatalkan").length);
      })
      .catch((err) => console.error("Error fetching orders:", err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAmbilPesanan = (id: number) => {
    fetch(`/api/pesanan/ambil-pesanan/${id}`, { method: "POST" })
      .then(() => {
        alert("Pesanan berhasil diambil!");
        fetchOrders();
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id: number) => {
    fetch(`/api/pesanan/delete/${id}`, { method: "DELETE" })
      .then(() => {
        alert("Pesanan berhasil dihapus.");
        fetchOrders();
      })
      .catch((err) => console.error(err));
  };

  const openModal = (id: number) => {
    setSelectedOrderId(id);
    setShowModal(true);
  };

  const handleSubmitLaporan = () => {
    if (!selectedOrderId) return;

    fetch(`/api/laporan-teknisi/create/${selectedOrderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ laporan, rating }),
    })
      .then(() => {
        return fetch(`/api/pesanan/update-status/${selectedOrderId}`, { method: "PUT" });
      })
      .then(() => {
        alert("Laporan berhasil dikirim dan status diperbarui!");
        setShowModal(false);
        setLaporan("");
        setRating(0);
        fetchOrders();
      })
      .catch((err) => console.error(err));
  };

  const aktifOrders = orders.filter((o) => o.statusPesanan !== "Pesanan Dibatalkan" && o.statusPesanan !== "SELESAI");
  const selesaiOrders = orders.filter((o) => o.statusPesanan === "SELESAI");

  return (
    <main className="min-h-screen bg-white">
      <NavbarTeknisi />

      {/* ACTIVE ORDERS */}
      <section className="px-6 py-8">
        <h2 className="text-xl font-semibold text-[#10316B] mb-4">
          Hi, Teknisi! Berikut orderan yang masuk
        </h2>
        <div className="flex items-center space-x-4 overflow-x-auto">
          {aktifOrders.map((order) => (
            <div
              key={order.id}
              className="min-w-[250px] border-2 rounded-2xl p-4 flex-shrink-0"
            >
              <p className="text-lg font-medium mb-2">{order.namaBarang}</p>
              <p className="text-sm mb-1">Deskripsi: {order.kondisiBarang}</p>
              <p className="text-sm text-gray-500">Status: {order.statusPesanan}</p>

              <button
                onClick={() => handleAmbilPesanan(order.id)}
                className="mt-2 w-full py-2 border-2 rounded-xl text-sm font-medium hover:bg-gray-100"
              >
                Ambil Pesanan
              </button>

              {order.statusPesanan === "DIKERJAKAN" && (
                <button
                  onClick={() => openModal(order.id)}
                  className="mt-2 w-full py-2 border-2 rounded-xl text-sm font-medium hover:bg-gray-100"
                >
                  Selesaikan Pesanan
                </button>
              )}

              <button
                onClick={() => handleDelete(order.id)}
                className="mt-2 w-full py-2 border border-red-500 text-red-500 rounded-xl text-sm hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* TOTAL ORDER + RATING */}
      <section className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-[#10316B] text-white">
          <h3 className="text-lg font-medium mb-4">Your Total Order</h3>
          <p className="text-6xl font-bold">{totalOrder}</p>
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

      {/* HISTORY */}
      <section className="px-6 py-8">
        <h2 className="text-xl font-semibold text-[#10316B] mb-4">History Pesanan Selesai</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selesaiOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <p className="text-lg font-medium">{order.namaBarang}</p>
              <p className="text-sm text-gray-600">Deskripsi: {order.kondisiBarang}</p>
              <p className="text-sm text-green-600 mt-2 font-semibold">Status: {order.statusPesanan}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-[#10316B]">Laporan Teknisi</h3>
            <textarea
              placeholder="Tulis laporan perbaikan..."
              className="w-full border rounded p-2 mb-4"
              value={laporan}
              onChange={(e) => setLaporan(e.target.value)}
            />
            <input
              type="number"
              placeholder="Rating (1-5)"
              className="w-full border rounded p-2 mb-4"
              value={rating}
              min={1}
              max={5}
              onChange={(e) => setRating(Number(e.target.value))}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded bg-[#10316B] text-white hover:bg-blue-900"
                onClick={handleSubmitLaporan}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
