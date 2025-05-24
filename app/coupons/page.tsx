"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Kupon {
    kodeKupon: string;
    potongan: number;
    batasPemakaian: number;
    jumlahPemakaian: number;
    aktif: boolean;
}

export default function CouponsPage() {
    const [kupons, setKupons] = useState<Kupon[]>([]);
    const [activeKupons, setActiveKupons] = useState<Kupon[]>([]);
    const [inactiveKupons, setInactiveKupons] = useState<Kupon[]>([]);
    const [totalKupons, setTotalKupons] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [inactiveCount, setInactiveCount] = useState(0);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedKupon, setSelectedKupon] = useState<Kupon | null>(null);
    const [formData, setFormData] = useState({
        kodeKupon: "",
        potongan: "",
        batasPemakaian: "",
    });

    // Helper function untuk menentukan apakah kupon benar-benar aktif
    const isKuponReallyActive = (kupon: Kupon) => {
        const jumlahPemakaian = kupon.jumlahPemakaian || 0;
        const batasPemakaian = kupon.batasPemakaian || 0;

        // Kupon aktif jika field aktif true DAN masih bisa digunakan
        // ATAU jika batas pemakaian masih tersisa (sesuai logika backend)
        return (
            (kupon.aktif && jumlahPemakaian < batasPemakaian) ||
            (batasPemakaian > 0 && jumlahPemakaian < batasPemakaian)
        );
    };

    // Fetch semua kupon
    const fetchAllKupons = async () => {
        try {
            const response = await fetch("/api/kupon");
            const data: Kupon[] = await response.json();
            setKupons(data);
            setTotalKupons(data.length);
        } catch (error) {
            console.error("Error fetching all kupons:", error);
        }
    };

    // Fetch kupon aktif
    const fetchActiveKupons = async () => {
        try {
            const response = await fetch("/api/kupon/active");
            const data: Kupon[] = await response.json();
            setActiveKupons(data);
            setActiveCount(data.length);
        } catch (error) {
            console.error("Error fetching active kupons:", error);
        }
    };

    // Fetch kupon tidak aktif
    const fetchInactiveKupons = async () => {
        try {
            const response = await fetch("/api/kupon/inactive");
            const data: Kupon[] = await response.json();
            setInactiveKupons(data);
            setInactiveCount(data.length);
        } catch (error) {
            console.error("Error fetching inactive kupons:", error);
        }
    };

    useEffect(() => {
        fetchAllKupons();
        fetchActiveKupons();
        fetchInactiveKupons();
    }, []);

    // Handle create kupon
    const handleCreateKupon = async () => {
        if (
            !formData.kodeKupon ||
            !formData.potongan ||
            !formData.batasPemakaian
        ) {
            alert("Mohon isi semua field!");
            return;
        }

        try {
            const response = await fetch("/api/kupon/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    kodeKupon: formData.kodeKupon,
                    potongan: parseInt(formData.potongan),
                    batasPemakaian: parseInt(formData.batasPemakaian),
                }),
            });

            if (response.ok) {
                alert("Kupon berhasil dibuat!");
                setShowCreateModal(false);
                setFormData({
                    kodeKupon: "",
                    potongan: "",
                    batasPemakaian: "",
                });
                fetchAllKupons();
                fetchActiveKupons();
            } else {
                alert("Gagal membuat kupon. Kode kupon mungkin sudah ada.");
            }
        } catch (error) {
            console.error("Error creating kupon:", error);
            alert("Error membuat kupon");
        }
    };

    // Handle update kupon
    const handleUpdateKupon = async () => {
        if (!selectedKupon || !formData.potongan || !formData.batasPemakaian) {
            alert("Mohon isi semua field!");
            return;
        }

        try {
            const response = await fetch(
                `/api/kupon/update/${selectedKupon.kodeKupon}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        potongan: parseInt(formData.potongan),
                        batasPemakaian: parseInt(formData.batasPemakaian),
                    }),
                }
            );

            if (response.ok) {
                alert("Kupon berhasil diupdate!");
                setShowUpdateModal(false);
                setSelectedKupon(null);
                setFormData({
                    kodeKupon: "",
                    potongan: "",
                    batasPemakaian: "",
                });
                fetchAllKupons();
                fetchActiveKupons();
                fetchInactiveKupons();
            } else {
                alert("Gagal mengupdate kupon.");
            }
        } catch (error) {
            console.error("Error updating kupon:", error);
            alert("Error mengupdate kupon");
        }
    };

    // Handle delete kupon
    const handleDeleteKupon = async () => {
        if (!selectedKupon) return;

        try {
            const response = await fetch(
                `/api/kupon/delete/${selectedKupon.kodeKupon}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                alert("Kupon berhasil dihapus!");
                setShowDeleteModal(false);
                setSelectedKupon(null);
                fetchAllKupons();
                fetchActiveKupons();
                fetchInactiveKupons();
            } else {
                alert("Gagal menghapus kupon.");
            }
        } catch (error) {
            console.error("Error deleting kupon:", error);
            alert("Error menghapus kupon");
        }
    };

    // Handle open modals
    const handleOpenCreateModal = () => {
        setFormData({ kodeKupon: "", potongan: "", batasPemakaian: "" });
        setShowCreateModal(true);
    };

    const handleOpenUpdateModal = (kupon: Kupon) => {
        setSelectedKupon(kupon);
        setFormData({
            kodeKupon: kupon.kodeKupon,
            potongan: kupon.potongan.toString(),
            batasPemakaian: kupon.batasPemakaian.toString(),
        });
        setShowUpdateModal(true);
    };

    const handleOpenDetailModal = (kupon: Kupon) => {
        setSelectedKupon(kupon);
        setShowDetailModal(true);
    };

    const handleOpenDeleteModal = (kupon: Kupon) => {
        setSelectedKupon(kupon);
        setShowDeleteModal(true);
    };

    return (
        <main className="min-h-screen bg-white">
            {/* Header */}
            <section className="px-6 py-8 bg-[#10316B] text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Manajemen Kupon
                        </h1>
                        <p className="text-blue-100">
                            Kelola kupon diskon untuk pelanggan
                        </p>
                    </div>
                    <Button
                        onClick={handleOpenCreateModal}
                        className="bg-white text-[#10316B] hover:bg-gray-100"
                    >
                        + Buat Kupon Baru
                    </Button>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-[#10316B] text-white">
                    <h3 className="text-lg font-medium mb-2">Total Kupon</h3>
                    <p className="text-5xl font-bold">{totalKupons}</p>
                </Card>

                <Card className="p-6 bg-green-600 text-white">
                    <h3 className="text-lg font-medium mb-2">Kupon Aktif</h3>
                    <p className="text-5xl font-bold">{activeCount}</p>
                </Card>

                <Card className="p-6 bg-red-600 text-white">
                    <h3 className="text-lg font-medium mb-2">Kupon Nonaktif</h3>
                    <p className="text-5xl font-bold">{inactiveCount}</p>
                </Card>
            </section>

            {/* Kupon List */}
            <section className="px-6 py-8">
                <h2 className="text-xl font-semibold text-[#10316B] mb-4">
                    Daftar Semua Kupon
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kupons.map((kupon) => (
                        <Card
                            key={kupon.kodeKupon}
                            className="p-4 border-2 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-[#10316B]">
                                    {kupon.kodeKupon}
                                </h3>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        isKuponReallyActive(kupon)
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {isKuponReallyActive(kupon)
                                        ? "Aktif"
                                        : "Nonaktif"}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm">
                                    <span className="font-medium">
                                        Potongan:
                                    </span>{" "}
                                    Rp {kupon.potongan.toLocaleString()}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">
                                        Batas Pemakaian:
                                    </span>{" "}
                                    {kupon.batasPemakaian}x
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">
                                        Sudah Digunakan:
                                    </span>{" "}
                                    {kupon.jumlahPemakaian || 0}x
                                </p>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleOpenDetailModal(kupon)}
                                    className="flex-1 py-2 text-sm border rounded-lg hover:bg-gray-50"
                                >
                                    Detail
                                </button>
                                <button
                                    onClick={() => handleOpenUpdateModal(kupon)}
                                    className="flex-1 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleOpenDeleteModal(kupon)}
                                    className="flex-1 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Hapus
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                {kupons.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            Belum ada kupon yang dibuat
                        </p>
                        <Button
                            onClick={handleOpenCreateModal}
                            className="mt-4 bg-[#10316B] hover:bg-[#0c244d]"
                        >
                            Buat Kupon Pertama
                        </Button>
                    </div>
                )}
            </section>

            {/* Modal Create Kupon */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-lg font-semibold mb-4">
                            Buat Kupon Baru
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Kode Kupon:
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.kodeKupon}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            kodeKupon: e.target.value,
                                        })
                                    }
                                    placeholder="Masukkan kode kupon"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Potongan Harga (Rp):
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border rounded"
                                    value={formData.potongan}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            potongan: e.target.value,
                                        })
                                    }
                                    placeholder="Masukkan jumlah potongan"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Batas Pemakaian:
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border rounded"
                                    value={formData.batasPemakaian}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            batasPemakaian: e.target.value,
                                        })
                                    }
                                    placeholder="Maksimal berapa kali bisa digunakan"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCreateKupon}
                                className="px-4 py-2 bg-[#10316B] text-white rounded hover:bg-[#0c244d]"
                            >
                                Buat Kupon
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Update Kupon */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-lg font-semibold mb-4">
                            Edit Kupon
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Kode Kupon:
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded bg-gray-100"
                                    value={formData.kodeKupon}
                                    disabled
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Kode kupon tidak bisa diubah
                                </p>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Potongan Harga (Rp):
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border rounded"
                                    value={formData.potongan}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            potongan: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Batas Pemakaian:
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border rounded"
                                    value={formData.batasPemakaian}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            batasPemakaian: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdateKupon}
                                className="px-4 py-2 bg-[#10316B] text-white rounded hover:bg-[#0c244d]"
                            >
                                Update Kupon
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detail Kupon */}
            {showDetailModal && selectedKupon && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h2 className="text-lg font-semibold mb-4">
                            Detail Kupon
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <span className="font-medium">Kode Kupon:</span>
                                <p className="text-lg font-bold text-[#10316B]">
                                    {selectedKupon.kodeKupon}
                                </p>
                            </div>

                            <div>
                                <span className="font-medium">
                                    Potongan Harga:
                                </span>
                                <p>
                                    Rp {selectedKupon.potongan.toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <span className="font-medium">
                                    Batas Pemakaian:
                                </span>
                                <p>{selectedKupon.batasPemakaian}x</p>
                            </div>

                            <div>
                                <span className="font-medium">
                                    Sudah Digunakan:
                                </span>
                                <p>{selectedKupon.jumlahPemakaian || 0}x</p>
                            </div>

                            <div>
                                <span className="font-medium">Status:</span>
                                <span
                                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                        isKuponReallyActive(selectedKupon)
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {isKuponReallyActive(selectedKupon)
                                        ? "Aktif"
                                        : "Nonaktif"}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
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

            {/* Modal Delete Confirmation */}
            {showDeleteModal && selectedKupon && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h2 className="text-lg font-semibold mb-4 text-red-600">
                            Konfirmasi Hapus
                        </h2>
                        <p className="mb-4">
                            Apakah Anda yakin ingin menghapus kupon{" "}
                            <strong>{selectedKupon.kodeKupon}</strong>?
                        </p>
                        <p className="text-sm text-gray-600 mb-6">
                            Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteKupon}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Hapus Kupon
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
