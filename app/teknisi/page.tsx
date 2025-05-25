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
  harga?: number;
  estimasiWaktu?: string;
}

export default function TeknisiPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrder, setTotalOrder] = useState(0);
  const [selesaiCount, setSelesaiCount] = useState(0);
  const [totalPenghasilan, setTotalPenghasilan] = useState(0);

  const [showSelesaikanModal, setShowSelesaikanModal] = useState(false);
  const [showAmbilModal, setShowAmbilModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [laporan, setLaporan] = useState("");
  const [estimasiHarga, setEstimasiHarga] = useState("");
  const [estimasiWaktu, setEstimasiWaktu] = useState("");

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.email) return;

<<<<<<< Updated upstream
  try {
    const res = await fetch(`/api/pesanan/teknisi/${user.email}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`
=======
    try {
      const res = await fetch(`/api/pesanan/teknisi/${user.email}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);

      if (Array.isArray(data)) {
        setTotalOrder(data.length);
        
        // Debug what statuses are actually coming back
        console.log("Status values in orders:", data.map(d => d.statusPesanan));
        
        // Make the filter case-insensitive and check for variations
        const selesai = data.filter((d: Order) => {
          const status = d.statusPesanan?.toLowerCase();
          return status === "pesanan selesai" || status === "selesai";
        });
        
        console.log("Completed orders:", selesai);
        setSelesaiCount(selesai.length);
        
        // Check the prices before calculating
        console.log("Prices of completed orders:", selesai.map(order => order.estimasiHarga));
        
        // Calculate total income from completed orders only
        const penghasilan = selesai.reduce((acc, cur) => {
          const harga = typeof cur.harga === 'string' 
            ? parseInt(cur.harga) 
            : (cur.harga || 0);
          return acc + harga;
        }, 0);

        
        console.log("Calculated total income:", penghasilan);
        setTotalPenghasilan(penghasilan);
>>>>>>> Stashed changes
      }
    } catch (err) {
      console.error("Gagal fetch pesanan:", err);
    }
  };

  const handleOpenAmbilModal = (id: number) => {
    setSelectedOrderId(id);
    setShowAmbilModal(true);
    setEstimasiHarga("");
    setEstimasiWaktu("");
  };

  const handleConfirmAmbilPesanan = async () => {
    if (!estimasiHarga || !estimasiWaktu || selectedOrderId === null) {
      alert("Isi estimasi harga dan waktu.");
      return;
    }

    const harga = parseInt(estimasiHarga);
    try {
      await fetch(`/api/pesanan/ambil-pesanan/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimasiHarga: harga, estimasiWaktu }),
      });

      alert("Pesanan berhasil diambil.");
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrderId
            ? {
                ...order,
                statusPesanan: "DIKERJAKAN",
                estimasiHarga: harga,
                estimasiWaktu,
              }
            : order
        )
      );
      setShowAmbilModal(false);
      setSelectedOrderId(null);
    } catch (err) {
      console.error("Gagal ambil pesanan:", err);
    }
  };

  const handleSelesaikanPesanan = (id: number) => {
    setSelectedOrderId(id);
    setShowSelesaikanModal(true);
  };

const handleSubmitLaporan = async () => {
  if (!laporan || selectedOrderId === null) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || !user.token) {
    alert("Token tidak ditemukan. Silakan login ulang.");
    return;
  }

  try {
    const response = await fetch(`/api/laporan-teknisi/create/${selectedOrderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`, // ← Tambahkan ini
      },
      body: JSON.stringify({ laporan, emailTeknisi: user.email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("HTTP Error:", response.status, errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert("Laporan berhasil dikirim.");
    setShowSelesaikanModal(false);
    setSelectedOrderId(null);
    setLaporan("");
  } catch (err) {
    console.error("Gagal kirim laporan:", err);
    alert("Gagal kirim laporan. Coba login ulang atau hubungi admin.");
  }
};



  const handleOpenDetailModal = (id: number) => {
    setSelectedOrderId(id);
    setShowDetailModal(true);
  };

  return (
    <main className="min-h-screen bg-white">
      <NavbarTeknisi />

      <section className="px-6 py-8">
        <h2 className="text-xl font-semibold text-[#10316B] mb-4">
          Hi, Teknisi! Berikut orderan yang masuk
        </h2>

        <div className="flex items-center space-x-4 overflow-x-auto">
          {orders.map((order) => (
            <div
              key={order.id}
              className="min-w-[250px] border-2 rounded-2xl p-4 flex-shrink-0 h-auto"
              style={{ width: "250px" }}
            >
              <p className="text-lg font-medium mb-2">{order.namaBarang}</p>
              <p className="text-sm mb-1">Deskripsi: {order.kondisiBarang}</p>
              <p className="text-sm text-gray-500">
                Status: {order.statusPesanan}
              </p>

              <button
                onClick={() => handleOpenDetailModal(order.id)}
                className="mt-2 w-full py-2 border rounded-xl text-sm hover:bg-gray-100"
              >
                Detail Pesanan
              </button>

              {order.statusPesanan === "Menunggu Konfirmasi Teknisi" && (
                <button
                  onClick={() => handleOpenAmbilModal(order.id)}
                  className="mt-2 w-full py-2 border-2 rounded-xl text-sm font-medium hover:bg-gray-100"
                >
                  Ambil Pesanan
                </button>
              )}

              <button
                onClick={() => handleSelesaikanPesanan(order.id)}
                className="mt-2 w-full py-2 border-2 rounded-xl text-sm font-medium hover:bg-gray-100"
              >
                Selesaikan Pesanan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Card Ringkasan */}
      <section className="px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-[#10316B] text-white">
          <h3 className="text-lg font-medium mb-2">Total Order</h3>
          <p className="text-5xl font-bold">{totalOrder}</p>
        </Card>

        <Card className="p-6 bg-green-600 text-white">
          <h3 className="text-lg font-medium mb-2">Pekerjaan Selesai</h3>
          <p className="text-5xl font-bold">{selesaiCount}</p>
        </Card>

        <Card className="p-6 bg-yellow-500 text-white">
          <h3 className="text-lg font-medium mb-2">Total Penghasilan</h3>
          <p className="text-4xl font-bold">Rp {totalPenghasilan.toLocaleString()}</p>
        </Card>
      </section>

       <Card className="p-6 mx-5">
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

      {/* Modal Selesaikan */}
      {showSelesaikanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Selesaikan Pesanan</h2>
            <label className="block mb-2 text-sm">Laporan:</label>
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows={3}
              value={laporan}
              onChange={(e) => setLaporan(e.target.value)}
            ></textarea>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSelesaikanModal(false);
                  setSelectedOrderId(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitLaporan}
                className="px-4 py-2 bg-[#10316B] text-white rounded hover:bg-[#0c244d]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ambil Pesanan */}
      {showAmbilModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Ambil Pesanan</h2>

            <label className="block mb-2 text-sm font-medium">Estimasi Harga (Rp):</label>
            <input
              type="number"
              min={0}
              className="w-full p-2 border rounded mb-4"
              value={estimasiHarga}
              onChange={(e) => setEstimasiHarga(e.target.value)}
              placeholder="Masukkan estimasi harga"
            />

            <label className="block mb-2 text-sm font-medium">Estimasi Waktu (hari):</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4"
              value={estimasiWaktu}
              onChange={(e) => setEstimasiWaktu(e.target.value)}
              placeholder="Masukkan estimasi waktu pengerjaan"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAmbilModal(false);
                  setSelectedOrderId(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAmbilPesanan}
                className="px-4 py-2 bg-[#10316B] text-white rounded hover:bg-[#0c244d]"
              >
                Ambil Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Detail Pesanan</h2>
            <p><strong>Nama Barang:</strong> {selectedOrder.namaBarang}</p>
            <p><strong>Deskripsi:</strong> {selectedOrder.kondisiBarang}</p>
            <p><strong>Status:</strong> {selectedOrder.statusPesanan}</p>
            {selectedOrder.harga !== undefined && (
              <p><strong>Estimasi Harga:</strong> Rp {selectedOrder.harga.toLocaleString()}</p>
            )}
            {selectedOrder.estimasiWaktu && (
              <p><strong>Estimasi Waktu:</strong> {selectedOrder.estimasiWaktu}</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
