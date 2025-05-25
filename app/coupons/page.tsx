"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Kupon {
    kodeKupon: string;
    potongan: number;
    batasPemakaian: number;
    jumlahPemakaian: number;
    aktif: boolean;
}

export default function CouponsPage() {
    const { toast } = useToast();

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

        return (
            (kupon.aktif && jumlahPemakaian < batasPemakaian) ||
            (batasPemakaian > 0 && jumlahPemakaian < batasPemakaian)
        );
    };

    // Validasi persentase
    const validatePercentage = (value: string) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 1 && num <= 100;
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
            toast({
                title: "❌ Error",
                description: "Gagal memuat data kupon",
                variant: "destructive",
            });
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
        const loadData = async () => {
            await Promise.all([
                fetchAllKupons(),
                fetchActiveKupons(),
                fetchInactiveKupons(),
            ]);
        };
        loadData();
    }, []);

    // Handle create kupon
    const handleCreateKupon = async () => {
        if (
            !formData.kodeKupon ||
            !formData.potongan ||
            !formData.batasPemakaian
        ) {
            toast({
                title: "⚠️ Peringatan",
                description: "Mohon isi semua field yang diperlukan!",
                variant: "destructive",
            });
            return;
        }

        if (!validatePercentage(formData.potongan)) {
            toast({
                title: "⚠️ Validasi Error",
                description: "Persentase potongan harus antara 1% - 100%!",
                variant: "destructive",
            });
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
                    potongan: parseFloat(formData.potongan),
                    batasPemakaian: parseInt(formData.batasPemakaian),
                }),
            });

            if (response.ok) {
                toast({
                    title: "✅ Berhasil!",
                    description: `Kupon ${formData.kodeKupon} berhasil dibuat!`,
                    variant: "default",
                });
                setShowCreateModal(false);
                setFormData({
                    kodeKupon: "",
                    potongan: "",
                    batasPemakaian: "",
                });
                await Promise.all([fetchAllKupons(), fetchActiveKupons()]);
            } else {
                toast({
                    title: "❌ Gagal",
                    description:
                        "Gagal membuat kupon. Kode kupon mungkin sudah ada.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error creating kupon:", error);
            toast({
                title: "❌ Error",
                description: "Terjadi kesalahan saat membuat kupon",
                variant: "destructive",
            });
        }
    };

    // Handle update kupon
    const handleUpdateKupon = async () => {
        if (!selectedKupon || !formData.potongan || !formData.batasPemakaian) {
            toast({
                title: "⚠️ Peringatan",
                description: "Mohon isi semua field yang diperlukan!",
                variant: "destructive",
            });
            return;
        }

        if (!validatePercentage(formData.potongan)) {
            toast({
                title: "⚠️ Validasi Error",
                description: "Persentase potongan harus antara 1% - 100%!",
                variant: "destructive",
            });
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
                        potongan: parseFloat(formData.potongan),
                        batasPemakaian: parseInt(formData.batasPemakaian),
                    }),
                }
            );

            if (response.ok) {
                toast({
                    title: "✅ Berhasil!",
                    description: `Kupon ${selectedKupon.kodeKupon} berhasil diupdate!`,
                    variant: "default",
                });
                setShowUpdateModal(false);
                setSelectedKupon(null);
                setFormData({
                    kodeKupon: "",
                    potongan: "",
                    batasPemakaian: "",
                });
                await Promise.all([
                    fetchAllKupons(),
                    fetchActiveKupons(),
                    fetchInactiveKupons(),
                ]);
            } else {
                toast({
                    title: "❌ Gagal",
                    description: "Gagal mengupdate kupon.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error updating kupon:", error);
            toast({
                title: "❌ Error",
                description: "Terjadi kesalahan saat mengupdate kupon",
                variant: "destructive",
            });
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
                toast({
                    title: "✅ Berhasil!",
                    description: `Kupon ${selectedKupon.kodeKupon} berhasil dihapus!`,
                    variant: "default",
                });
                setShowDeleteModal(false);
                setSelectedKupon(null);
                await Promise.all([
                    fetchAllKupons(),
                    fetchActiveKupons(),
                    fetchInactiveKupons(),
                ]);
            } else {
                toast({
                    title: "❌ Gagal",
                    description: "Gagal menghapus kupon.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error deleting kupon:", error);
            toast({
                title: "❌ Error",
                description: "Terjadi kesalahan saat menghapus kupon",
                variant: "destructive",
            });
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
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Neon Grid Background */}

            {/* Header */}
            <section className="relative px-6 py-12 border-b border-cyan-500/20">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                            ⚡ KUPON MANAGER ⚡
                        </h1>
                        <p className="text-cyan-300/80 text-lg font-medium tracking-wide">
                            Coupons Control System
                        </p>
                        <div className="flex space-x-4 text-sm">
                            <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-300">
                                🔥 ACTIVE
                            </span>
                        </div>
                    </div>
                    <Button
                        onClick={handleOpenCreateModal}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0 px-8 py-3 text-lg font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
                    >
                        ✨ CREATE NEW KUPON
                    </Button>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/30 backdrop-blur-sm shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-105">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <h3 className="text-cyan-300 font-medium text-lg mb-1">
                                TOTAL KUPONS
                            </h3>
                            <p className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                {totalKupons}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-green-500/30 backdrop-blur-sm shadow-2xl shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-500 hover:scale-105">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <div>
                            <h3 className="text-green-300 font-medium text-lg mb-1">
                                ACTIVE NODES
                            </h3>
                            <p className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                {activeCount}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-red-500/30 backdrop-blur-sm shadow-2xl shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-500 hover:scale-105">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30">
                            <span className="text-2xl">💤</span>
                        </div>
                        <div>
                            <h3 className="text-red-300 font-medium text-lg mb-1">
                                INACTIVE NODES
                            </h3>
                            <p className="text-5xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                                {inactiveCount}
                            </p>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Kupon List */}
            <section className="px-6 py-8">
                <div className="flex items-center space-x-4 mb-8">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        🔮 KUPON DATABASE
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-purple-500/50"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kupons.map((kupon, index) => (
                        <Card
                            key={kupon.kodeKupon}
                            className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 backdrop-blur-sm shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-105 hover:border-purple-500/30 group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                                        {kupon.kodeKupon}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-400 font-mono">
                                            ID:
                                        </span>
                                        <span className="text-xs text-cyan-300 font-mono">
                                            #{kupon.kodeKupon.slice(-4)}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${
                                        isKuponReallyActive(kupon)
                                            ? "bg-green-500/20 text-green-300 border-green-500/50 shadow-lg shadow-green-500/20"
                                            : "bg-red-500/20 text-red-300 border-red-500/50 shadow-lg shadow-red-500/20"
                                    }`}
                                >
                                    {isKuponReallyActive(kupon)
                                        ? "🟢 ONLINE"
                                        : "🔴 OFFLINE"}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg border border-cyan-500/10">
                                    <span className="text-cyan-300 font-medium flex items-center space-x-2">
                                        <span>💰</span>
                                        <span>Discount Rate:</span>
                                    </span>
                                    <span className="text-white font-bold text-lg">
                                        {kupon.potongan}%
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg border border-purple-500/10">
                                    <span className="text-purple-300 font-medium flex items-center space-x-2">
                                        <span>🎯</span>
                                        <span>Max Usage:</span>
                                    </span>
                                    <span className="text-white font-bold">
                                        {kupon.batasPemakaian}x
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg border border-pink-500/10">
                                    <span className="text-pink-300 font-medium flex items-center space-x-2">
                                        <span>📈</span>
                                        <span>Used:</span>
                                    </span>
                                    <span className="text-white font-bold">
                                        {kupon.jumlahPemakaian || 0}x
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">
                                            Usage Progress
                                        </span>
                                        <span className="text-gray-300">
                                            {Math.round(
                                                ((kupon.jumlahPemakaian || 0) /
                                                    kupon.batasPemakaian) *
                                                    100
                                            )}
                                            %
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 rounded-full h-2 border border-slate-600/50">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${Math.min(
                                                    ((kupon.jumlahPemakaian ||
                                                        0) /
                                                        kupon.batasPemakaian) *
                                                        100,
                                                    100
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleOpenDetailModal(kupon)}
                                    className="py-2 px-3 text-xs font-medium bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white rounded-lg border border-slate-600/30 hover:border-cyan-500/50 transition-all duration-300"
                                >
                                    📋 Detail
                                </button>
                                <button
                                    onClick={() => handleOpenUpdateModal(kupon)}
                                    className="py-2 px-3 text-xs font-medium bg-gradient-to-r from-blue-600/50 to-purple-600/50 hover:from-blue-500/50 hover:to-purple-500/50 text-white rounded-lg border border-blue-500/30 hover:border-purple-500/50 transition-all duration-300"
                                >
                                    ⚙️ Edit
                                </button>
                                <button
                                    onClick={() => handleOpenDeleteModal(kupon)}
                                    className="py-2 px-3 text-xs font-medium bg-gradient-to-r from-red-600/50 to-pink-600/50 hover:from-red-500/50 hover:to-pink-500/50 text-white rounded-lg border border-red-500/30 hover:border-pink-500/50 transition-all duration-300"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                {kupons.length === 0 && (
                    <div className="text-center py-20">
                        <div className="space-y-6">
                            <div className="text-8xl">🔮</div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                NEURAL DATABASE EMPTY
                            </h3>
                            <p className="text-gray-400 text-lg">
                                Initialize your first kupon node
                            </p>
                            <Button
                                onClick={handleOpenCreateModal}
                                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white px-8 py-3 text-lg font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
                            >
                                🚀 INITIALIZE FIRST KUPON
                            </Button>
                        </div>
                    </div>
                )}
            </section>

            {/* Modal Create Kupon */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-cyan-500/10 border border-cyan-500/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="text-2xl">✨</span>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                Create New Kupon
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-cyan-300 font-medium flex items-center space-x-2">
                                    <span>🔤</span>
                                    <span>Kupon Code:</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-slate-700/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-300"
                                    value={formData.kodeKupon}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            kodeKupon: e.target.value,
                                        })
                                    }
                                    placeholder="Enter kupon code"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-purple-300 font-medium flex items-center space-x-2">
                                    <span>💰</span>
                                    <span>Discount Percentage (%):</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    step="0.1"
                                    className="w-full p-4 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300"
                                    value={formData.potongan}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (
                                            value === "" ||
                                            (parseFloat(value) >= 1 &&
                                                parseFloat(value) <= 100)
                                        ) {
                                            setFormData({
                                                ...formData,
                                                potongan: value,
                                            });
                                        }
                                    }}
                                    placeholder="1 - 100"
                                />
                                <p className="text-xs text-gray-400">
                                    Range: 1% - 100%
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-pink-300 font-medium flex items-center space-x-2">
                                    <span>🎯</span>
                                    <span>Usage Limit:</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-4 bg-slate-700/50 border border-pink-500/30 rounded-xl text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 focus:outline-none transition-all duration-300"
                                    value={formData.batasPemakaian}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            batasPemakaian: e.target.value,
                                        })
                                    }
                                    placeholder="Maximum usage count"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-8">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateKupon}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105 font-bold"
                            >
                                🚀 Create Kupon
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Update Kupon */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="text-2xl">⚙️</span>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Update Kupon
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-cyan-300 font-medium">
                                    Kupon Code:
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl text-gray-400 cursor-not-allowed"
                                    value={formData.kodeKupon}
                                    disabled
                                />
                                <p className="text-xs text-gray-500">
                                    🔒 Kupon code cannot be modified
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-purple-300 font-medium flex items-center space-x-2">
                                    <span>💰</span>
                                    <span>Discount Percentage (%):</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    step="0.1"
                                    className="w-full p-4 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300"
                                    value={formData.potongan}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (
                                            value === "" ||
                                            (parseFloat(value) >= 1 &&
                                                parseFloat(value) <= 100)
                                        ) {
                                            setFormData({
                                                ...formData,
                                                potongan: value,
                                            });
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-400">
                                    Range: 1% - 100%
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-pink-300 font-medium flex items-center space-x-2">
                                    <span>🎯</span>
                                    <span>Usage Limit:</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-4 bg-slate-700/50 border border-pink-500/30 rounded-xl text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 focus:outline-none transition-all duration-300"
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

                        <div className="flex justify-end space-x-4 mt-8">
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateKupon}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 font-bold"
                            >
                                💫 Update Kupon
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detail Kupon */}
            {showDetailModal && selectedKupon && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-cyan-500/10 border border-cyan-500/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="text-2xl">📋</span>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Kupon Details
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-700/30 rounded-xl border border-cyan-500/20">
                                <span className="block text-cyan-300 font-medium mb-2 flex items-center space-x-2">
                                    <span>🔤</span>
                                    <span>Kupon Code:</span>
                                </span>
                                <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                    {selectedKupon.kodeKupon}
                                </p>
                            </div>

                            <div className="p-4 bg-slate-700/30 rounded-xl border border-purple-500/20">
                                <span className="block text-purple-300 font-medium mb-2 flex items-center space-x-2">
                                    <span>💰</span>
                                    <span>Discount Rate:</span>
                                </span>
                                <p className="text-xl font-bold text-white">
                                    {selectedKupon.potongan}% OFF
                                </p>
                            </div>

                            <div className="p-4 bg-slate-700/30 rounded-xl border border-pink-500/20">
                                <span className="block text-pink-300 font-medium mb-2 flex items-center space-x-2">
                                    <span>🎯</span>
                                    <span>Usage Limit:</span>
                                </span>
                                <p className="text-xl font-bold text-white">
                                    {selectedKupon.batasPemakaian}x
                                </p>
                            </div>

                            <div className="p-4 bg-slate-700/30 rounded-xl border border-green-500/20">
                                <span className="block text-green-300 font-medium mb-2 flex items-center space-x-2">
                                    <span>📈</span>
                                    <span>Times Used:</span>
                                </span>
                                <p className="text-xl font-bold text-white">
                                    {selectedKupon.jumlahPemakaian || 0}x
                                </p>
                            </div>

                            <div className="p-4 bg-slate-700/30 rounded-xl border border-blue-500/20">
                                <span className="block text-blue-300 font-medium mb-2 flex items-center space-x-2">
                                    <span>⚡</span>
                                    <span>System Status:</span>
                                </span>
                                <div className="flex items-center space-x-3">
                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-bold border ${
                                            isKuponReallyActive(selectedKupon)
                                                ? "bg-green-500/20 text-green-300 border-green-500/50"
                                                : "bg-red-500/20 text-red-300 border-red-500/50"
                                        }`}
                                    >
                                        {isKuponReallyActive(selectedKupon)
                                            ? "🟢 ONLINE"
                                            : "🔴 OFFLINE"}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Indicator */}
                            <div className="p-4 bg-slate-700/30 rounded-xl border border-orange-500/20">
                                <span className="block text-orange-300 font-medium mb-3 flex items-center space-x-2">
                                    <span>📊</span>
                                    <span>Usage Analytics:</span>
                                </span>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">
                                            Progress
                                        </span>
                                        <span className="text-white font-bold">
                                            {Math.round(
                                                ((selectedKupon.jumlahPemakaian ||
                                                    0) /
                                                    selectedKupon.batasPemakaian) *
                                                    100
                                            )}
                                            %
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-600/50 rounded-full h-3 border border-slate-500/50">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${Math.min(
                                                    ((selectedKupon.jumlahPemakaian ||
                                                        0) /
                                                        selectedKupon.batasPemakaian) *
                                                        100,
                                                    100
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105 font-bold"
                            >
                                🚀 Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Delete Confirmation */}
            {showDeleteModal && selectedKupon && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-red-500/10 border border-red-500/20">
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="text-2xl">⚠️</span>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                                Delete Confirmation
                            </h2>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <p className="text-red-300 font-medium">
                                    ⚠️ You are about to permanently delete
                                    kupon:
                                </p>
                                <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mt-2">
                                    {selectedKupon.kodeKupon}
                                </p>
                            </div>

                            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                                <p className="text-orange-300 text-sm">
                                    🔥 This action cannot be undone. All data
                                    associated with this kupon will be
                                    permanently removed from the
                                    database.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteKupon}
                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white rounded-xl shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105 font-bold"
                            >
                                🗑️ Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
