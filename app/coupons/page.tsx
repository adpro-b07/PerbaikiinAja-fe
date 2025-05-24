"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Loader2,
    Filter,
    Copy,
    Edit,
    Trash2,
    Plus,
    Search,
    Shield,
    Sparkles,
    Eye,
    Download,
    Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CouponAPI, type Coupon } from "@/lib/api/coupon-api";

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        discountType: "percentage" as "percentage" | "fixed",
        discountValue: 0,
        maxUsage: 0,
        minOrderAmount: 0,
        expiryDate: "",
        isActive: true,
    });

    // Load coupons from API on component mount
    useEffect(() => {
        loadCoupons();
    }, []);

    // Load coupons from backend
    const loadCoupons = async () => {
        try {
            setIsInitialLoading(true);
            const fetchedCoupons = await CouponAPI.getAllCoupons();
            setCoupons(fetchedCoupons);
        } catch (error) {
            toast({
                title: "Error",
                description: "Gagal memuat data kupon",
                variant: "destructive",
            });
            console.error("Error loading coupons:", error);
        } finally {
            setIsInitialLoading(false);
        }
    };

    // Generate random coupon code
    const generateCouponCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Filter coupons
    const filteredCoupons = coupons.filter((coupon) => {
        const matchesSearch =
            coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterStatus === "all" ||
            (filterStatus === "active" && coupon.isActive) ||
            (filterStatus === "inactive" && !coupon.isActive) ||
            (filterStatus === "expired" &&
                new Date(coupon.expiryDate) < new Date());
        return matchesSearch && matchesFilter;
    });

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            discountType: "percentage",
            discountValue: 0,
            maxUsage: 0,
            minOrderAmount: 0,
            expiryDate: "",
            isActive: true,
        });
    };

    // Handle create coupon
    const handleCreateCoupon = async () => {
        setIsLoading(true);
        try {
            // Validasi input yang diperlukan backend
            if (!formData.discountValue || formData.discountValue <= 0) {
                toast({
                    title: "Error",
                    description: "Nilai diskon harus lebih besar dari 0",
                    variant: "destructive",
                });
                return;
            }

            if (!formData.maxUsage || formData.maxUsage <= 0) {
                toast({
                    title: "Error",
                    description: "Maksimal penggunaan harus lebih besar dari 0",
                    variant: "destructive",
                });
                return;
            }

            const newCouponData = {
                code: generateCouponCode(), // Generate kode kupon
                discountValue: formData.discountValue, // akan di-map ke 'potongan'
                maxUsage: formData.maxUsage, // akan di-map ke 'batasPemakaian'
                // Field lain tidak dikirim ke backend karena tidak diperlukan
                name: formData.name || `Kupon ${formData.discountValue}%`,
                description:
                    formData.description ||
                    `Kupon diskon ${formData.discountValue}%`,
                discountType: formData.discountType,
                minOrderAmount: formData.minOrderAmount,
                expiryDate: formData.expiryDate,
                isActive: formData.isActive,
            };

            const newCoupon = await CouponAPI.createCoupon(newCouponData);
            setCoupons([...coupons, newCoupon]);
            setIsCreateDialogOpen(false);
            resetForm();
            toast({
                title: "Sukses",
                description: `Kupon berhasil dibuat! Kode kupon: ${newCoupon.code}`,
            });
        } catch (error) {
            console.error("Create coupon error:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Gagal membuat kupon",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle edit coupon
    const handleEditCoupon = async () => {
        if (!selectedCoupon) return;

        setIsLoading(true);
        try {
            // Validasi input yang diperlukan backend
            if (!formData.discountValue || formData.discountValue <= 0) {
                toast({
                    title: "Error",
                    description: "Nilai diskon harus lebih besar dari 0",
                    variant: "destructive",
                });
                return;
            }

            if (!formData.maxUsage || formData.maxUsage <= 0) {
                toast({
                    title: "Error",
                    description: "Maksimal penggunaan harus lebih besar dari 0",
                    variant: "destructive",
                });
                return;
            }

            const updateData = {
                discountValue: formData.discountValue, // akan di-map ke 'potongan'
                maxUsage: formData.maxUsage, // akan di-map ke 'batasPemakaian'
                // Field lain tidak dikirim ke backend
                name: formData.name,
                description: formData.description,
                discountType: formData.discountType,
                minOrderAmount: formData.minOrderAmount,
                expiryDate: formData.expiryDate,
                isActive: formData.isActive,
            };

            const updatedCoupon = await CouponAPI.updateCoupon(
                selectedCoupon.code,
                updateData
            );

            const updatedCoupons = coupons.map((coupon) =>
                coupon.id === selectedCoupon.id ? updatedCoupon : coupon
            );

            setCoupons(updatedCoupons);
            setIsEditDialogOpen(false);
            setSelectedCoupon(null);
            resetForm();
            toast({
                title: "Sukses",
                description: "Kupon berhasil diperbarui!",
            });
        } catch (error) {
            console.error("Update coupon error:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Gagal memperbarui kupon",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete coupon
    const handleDeleteCoupon = async (couponCode: string) => {
        setIsLoading(true);
        try {
            await CouponAPI.deleteCoupon(couponCode);
            setCoupons(coupons.filter((coupon) => coupon.code !== couponCode));
            toast({
                title: "Sukses",
                description: "Kupon berhasil dihapus!",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Gagal menghapus kupon",
                variant: "destructive",
            });
            console.error("Error deleting coupon:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Open edit dialog
    const openEditDialog = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setFormData({
            name: coupon.name,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            maxUsage: coupon.maxUsage,
            minOrderAmount: coupon.minOrderAmount,
            expiryDate: coupon.expiryDate,
            isActive: coupon.isActive,
        });
        setIsEditDialogOpen(true);
    };

    // Copy coupon code
    const copyCouponCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Sukses",
            description: "Kode kupon disalin!",
        });
    };

    // Get status badge
    const getStatusBadge = (coupon: Coupon) => {
        const isExpired = new Date(coupon.expiryDate) < new Date();
        const isFullyUsed = coupon.currentUsage >= coupon.maxUsage;

        if (isExpired) {
            return (
                <Badge
                    variant="destructive"
                    className="bg-red-500/20 text-red-400 border-red-500/30"
                >
                    Kedaluwarsa
                </Badge>
            );
        }
        if (isFullyUsed) {
            return (
                <Badge
                    variant="secondary"
                    className="bg-gray-500/20 text-gray-400 border-gray-500/30"
                >
                    Habis
                </Badge>
            );
        }
        if (coupon.isActive) {
            return (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Aktif
                </Badge>
            );
        }
        return (
            <Badge
                variant="outline"
                className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            >
                Nonaktif
            </Badge>
        );
    };

    // Show loading spinner during initial load
    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                    <span className="text-xl text-white">
                        Memuat data kupon...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Shield className="h-8 w-8 text-purple-400" />
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Manajemen Kupon
                            </h1>
                        </div>
                        <p className="text-slate-400">
                            Kelola kupon diskon untuk pelanggan
                        </p>
                    </div>

                    <Dialog
                        open={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Kupon Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-400" />
                                    Buat Kupon Baru
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Buat kupon diskon baru. Kode kupon akan
                                    dibuat otomatis.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Kupon</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="bg-slate-800 border-slate-600"
                                            placeholder="Masukkan nama kupon"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="discountType">
                                            Jenis Diskon
                                        </Label>
                                        <Select
                                            value={formData.discountType}
                                            onValueChange={(
                                                value: "percentage" | "fixed"
                                            ) =>
                                                setFormData({
                                                    ...formData,
                                                    discountType: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="bg-slate-800 border-slate-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-600">
                                                <SelectItem value="percentage">
                                                    Persentase (%)
                                                </SelectItem>
                                                <SelectItem value="fixed">
                                                    Nominal (Rp)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Deskripsi
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        className="bg-slate-800 border-slate-600"
                                        placeholder="Deskripsi kupon"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="discountValue">
                                            Nilai Diskon{" "}
                                            {formData.discountType ===
                                            "percentage"
                                                ? "(%)"
                                                : "(Rp)"}
                                        </Label>
                                        <Input
                                            id="discountValue"
                                            type="number"
                                            value={formData.discountValue}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    discountValue: Number(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className="bg-slate-800 border-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxUsage">
                                            Maksimal Penggunaan
                                        </Label>
                                        <Input
                                            id="maxUsage"
                                            type="number"
                                            value={formData.maxUsage}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    maxUsage: Number(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className="bg-slate-800 border-slate-600"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="minOrderAmount">
                                            Minimal Pembelian (Rp)
                                        </Label>
                                        <Input
                                            id="minOrderAmount"
                                            type="number"
                                            value={formData.minOrderAmount}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    minOrderAmount: Number(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className="bg-slate-800 border-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expiryDate">
                                            Tanggal Kedaluwarsa
                                        </Label>
                                        <Input
                                            id="expiryDate"
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    expiryDate: e.target.value,
                                                })
                                            }
                                            className="bg-slate-800 border-slate-600"
                                        />
                                    </div>
                                </div>{" "}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) =>
                                            setFormData({
                                                ...formData,
                                                isActive: checked,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="isActive"
                                        className="text-white font-medium"
                                    >
                                        Aktifkan kupon
                                    </Label>
                                </div>
                            </div>{" "}
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                    className="border-slate-600 text-slate-200 hover:text-white hover:bg-slate-700"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleCreateCoupon}
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Membuat...
                                        </>
                                    ) : (
                                        "Buat Kupon"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">
                                        Total Kupon
                                    </p>
                                    <p className="text-2xl font-bold text-white">
                                        {coupons.length}
                                    </p>
                                </div>
                                <Zap className="h-8 w-8 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">
                                        Kupon Aktif
                                    </p>
                                    <p className="text-2xl font-bold text-green-400">
                                        {
                                            coupons.filter((c) => c.isActive)
                                                .length
                                        }
                                    </p>
                                </div>
                                <Sparkles className="h-8 w-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">
                                        Total Penggunaan
                                    </p>
                                    <p className="text-2xl font-bold text-blue-400">
                                        {coupons.reduce(
                                            (sum, c) => sum + c.currentUsage,
                                            0
                                        )}
                                    </p>
                                </div>
                                <Eye className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">
                                        Kedaluwarsa
                                    </p>
                                    <p className="text-2xl font-bold text-red-400">
                                        {
                                            coupons.filter(
                                                (c) =>
                                                    new Date(c.expiryDate) <
                                                    new Date()
                                            ).length
                                        }
                                    </p>
                                </div>
                                <Trash2 className="h-8 w-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Cari kupon..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10 bg-slate-700 border-slate-600"
                                    />
                                </div>
                            </div>
                            <Select
                                value={filterStatus}
                                onValueChange={setFilterStatus}
                            >
                                <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600">
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Aktif
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Nonaktif
                                    </SelectItem>
                                    <SelectItem value="expired">
                                        Kedaluwarsa
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                className="border-slate-600 hover:border-slate-500"
                                onClick={loadCoupons}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Coupons Table */}
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">
                            Daftar Kupon
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Kelola semua kupon diskon Anda di sini
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-700">
                                        <TableHead className="text-slate-300">
                                            Kode
                                        </TableHead>
                                        <TableHead className="text-slate-300">
                                            Nama
                                        </TableHead>
                                        <TableHead className="text-slate-300">
                                            Diskon
                                        </TableHead>
                                        <TableHead className="text-slate-300">
                                            Penggunaan
                                        </TableHead>
                                        <TableHead className="text-slate-300">
                                            Min. Pembelian
                                        </TableHead>
                                        <TableHead className="text-slate-300">
                                            Kedaluwarsa
                                        </TableHead>
                                        <TableHead className="text-slate-300">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-slate-300">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCoupons.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-center py-10 text-slate-400"
                                            >
                                                {searchTerm ||
                                                filterStatus !== "all"
                                                    ? "Tidak ada kupon yang sesuai dengan kriteria pencarian"
                                                    : "Belum ada kupon tersedia"}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCoupons.map((coupon) => (
                                            <TableRow
                                                key={coupon.id}
                                                className="border-slate-700"
                                            >
                                                <TableCell className="font-mono">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-purple-400">
                                                            {coupon.code}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                copyCouponCode(
                                                                    coupon.code
                                                                )
                                                            }
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {coupon.name}
                                                        </p>
                                                        <p className="text-sm text-slate-400">
                                                            {coupon.description}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-green-400">
                                                        {coupon.discountType ===
                                                        "percentage"
                                                            ? `${coupon.discountValue}%`
                                                            : `Rp ${coupon.discountValue.toLocaleString()}`}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white">
                                                                {
                                                                    coupon.currentUsage
                                                                }
                                                            </span>
                                                            <span className="text-slate-400">
                                                                /
                                                            </span>
                                                            <span className="text-slate-400">
                                                                {
                                                                    coupon.maxUsage
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                                                style={{
                                                                    width: `${
                                                                        (coupon.currentUsage /
                                                                            coupon.maxUsage) *
                                                                        100
                                                                    }%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-300">
                                                    Rp{" "}
                                                    {coupon.minOrderAmount.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-slate-300">
                                                    {new Date(
                                                        coupon.expiryDate
                                                    ).toLocaleDateString(
                                                        "id-ID"
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(coupon)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    coupon
                                                                )
                                                            }
                                                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="bg-slate-900 border-slate-700">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-white">
                                                                        Hapus
                                                                        Kupon
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-slate-400">
                                                                        Apakah
                                                                        Anda
                                                                        yakin
                                                                        ingin
                                                                        menghapus
                                                                        kupon "
                                                                        {
                                                                            coupon.name
                                                                        }
                                                                        "?
                                                                        Tindakan
                                                                        ini
                                                                        tidak
                                                                        dapat
                                                                        dibatalkan.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="border-slate-600">
                                                                        Batal
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            handleDeleteCoupon(
                                                                                coupon.code
                                                                            )
                                                                        }
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        {isLoading ? (
                                                                            <>
                                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                                Menghapus...
                                                                            </>
                                                                        ) : (
                                                                            "Hapus"
                                                                        )}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                >
                    <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5 text-blue-400" />
                                Edit Kupon
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Perbarui informasi kupon. Kode kupon tidak dapat
                                diubah.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">
                                        Nama Kupon
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        className="bg-slate-800 border-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-discountType">
                                        Jenis Diskon
                                    </Label>
                                    <Select
                                        value={formData.discountType}
                                        onValueChange={(
                                            value: "percentage" | "fixed"
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                discountType: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-800 border-slate-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-600">
                                            <SelectItem value="percentage">
                                                Persentase (%)
                                            </SelectItem>
                                            <SelectItem value="fixed">
                                                Nominal (Rp)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">
                                    Deskripsi
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="bg-slate-800 border-slate-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-discountValue">
                                        Nilai Diskon{" "}
                                        {formData.discountType === "percentage"
                                            ? "(%)"
                                            : "(Rp)"}
                                    </Label>
                                    <Input
                                        id="edit-discountValue"
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                discountValue: Number(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="bg-slate-800 border-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-maxUsage">
                                        Maksimal Penggunaan
                                    </Label>
                                    <Input
                                        id="edit-maxUsage"
                                        type="number"
                                        value={formData.maxUsage}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                maxUsage: Number(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="bg-slate-800 border-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-minOrderAmount">
                                        Minimal Pembelian (Rp)
                                    </Label>
                                    <Input
                                        id="edit-minOrderAmount"
                                        type="number"
                                        value={formData.minOrderAmount}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                minOrderAmount: Number(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="bg-slate-800 border-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-expiryDate">
                                        Tanggal Kedaluwarsa
                                    </Label>
                                    <Input
                                        id="edit-expiryDate"
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                expiryDate: e.target.value,
                                            })
                                        }
                                        className="bg-slate-800 border-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            isActive: checked,
                                        })
                                    }
                                />{" "}
                                <Label
                                    htmlFor="edit-isActive"
                                    className="text-white font-medium"
                                >
                                    Aktifkan kupon
                                </Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                                className="border-slate-600 text-slate-200 hover:text-white hover:bg-slate-700"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleEditCoupon}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-blue-600 to-purple-600"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan Perubahan"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
