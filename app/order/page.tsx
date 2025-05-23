"use client";

import { useEffect, useState } from "react";

export default function OrderPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [namaBarang, setNamaBarang] = useState("");
  const [kondisiBarang, setKondisiBarang] = useState("");
  const [kodeKupon, setKodeKupon] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kuponList, setKuponList] = useState<any[]>([]);

  const fetchOrders = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/pesanan/pengguna/${user.email}`, {
        credentials: "include",
      });
      const data = await res.json();
      console.log("Fetched orders:", data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Fetch payment methods
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch("/api/payment");
        const data = await res.json();
        setPaymentMethods(Array.isArray(data) ? data : []);
      } catch (err) {
        setPaymentMethods([]);
      }
    };
    fetchPaymentMethods();
    // Fetch active coupons
    const fetchKupon = async () => {
      try {
        const res = await fetch("/api/kupon/active");
        const data = await res.json();
        setKuponList(Array.isArray(data) ? data : []);
      } catch (err) {
        setKuponList([]);
      }
    };
    fetchKupon();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.email) {
      alert("User not found");
      setIsSubmitting(false);
      return;
    }
    try {
      const res = await fetch("/api/pesanan/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaBarang,
          kondisiBarang,
          kodeKupon: kodeKupon || undefined,
          emailPengguna: user.email,
          metodePembayaran,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setShowCreate(false);
        setNamaBarang("");
        setKondisiBarang("");
        setKodeKupon("");
        setMetodePembayaran("");
        fetchOrders();
      } else {
        alert("Failed to create order");
      }
    } catch (err) {
      alert("Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel order handler
  const handleCancelOrder = async (idPesanan: number) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`/api/pesanan/update-status/${idPesanan}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dibatalkan" }),
        credentials: "include",
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert("Failed to cancel order");
      }
    } catch (err) {
      alert("Failed to cancel order");
    }
  };

  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-[#10316B] mb-6">Your Orders</h1>
      <button
        className="mb-4 px-4 py-2 bg-[#10316B] text-white rounded hover:bg-[#0B409C]"
        onClick={() => setShowCreate(true)}
      >
        + Create Order
      </button>
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[#10316B]">
              Create New Order
            </h2>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Nama Barang</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Kondisi Barang</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  value={kondisiBarang}
                  onChange={(e) => setKondisiBarang(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Kode Kupon (opsional)
                </label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={kodeKupon}
                  onChange={(e) => setKodeKupon(e.target.value)}
                >
                  <option value="">Tanpa kupon</option>
                  {kuponList.map((kupon: any) => (
                    <option key={kupon.id} value={kupon.kodeKupon}>
                      {kupon.kodeKupon} (Potongan: {kupon.potongan}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Metode Pembayaran
                </label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={metodePembayaran}
                  onChange={(e) => setMetodePembayaran(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Pilih metode pembayaran
                  </option>
                  {paymentMethods.map((pm: any) => (
                    <option key={pm.id} value={pm.name}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setShowCreate(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#10316B] text-white rounded hover:bg-[#0B409C]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
                    <td className="px-4 py-2">
                      {order.statusPesanan}
                      {order.statusPesanan ===
                        "Menunggu Konfirmasi Teknisi" && (
                        <button
                          className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
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
