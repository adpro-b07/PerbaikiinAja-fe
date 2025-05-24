"use client";

import { useState } from "react";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Download,
    Eye,
    Copy,
    Zap,
    Sparkles,
    Shield,
} from "lucide-react";

// Types
interface Coupon {
    id: string;
    code: string;
    name: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    maxUsage: number;
    currentUsage: number;
    minOrderAmount: number;
    expiryDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Mock data - replace with actual API calls
const mockCoupons: Coupon[] = [
    {
        id: "1",
        code: "WELCOME2024",
        name: "Welcome Discount",
        description: "Diskon selamat datang untuk pengguna baru",
        discountType: "percentage",
        discountValue: 20,
        maxUsage: 100,
        currentUsage: 45,
        minOrderAmount: 50000,
        expiryDate: "2024-12-31",
        isActive: true,
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15",
    },
    {
        id: "2",
        code: "FLASH50",
        name: "Flash Sale",
        description: "Diskon kilat untuk pembelian hari ini",
        discountType: "fixed",
        discountValue: 50000,
        maxUsage: 50,
        currentUsage: 32,
        minOrderAmount: 200000,
        expiryDate: "2024-06-30",
        isActive: true,
        createdAt: "2024-01-10",
        updatedAt: "2024-01-20",
    },
];

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
            const newCoupon: Coupon = {
                id: Date.now().toString(),
                code: generateCouponCode(),
                ...formData,
                currentUsage: 0,
                createdAt: new Date().toISOString().split("T")[0],
                updatedAt: new Date().toISOString().split("T")[0],
            };

            setCoupons([...coupons, newCoupon]);
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success("Kupon berhasil dibuat!", {
                description: `Kode kupon: ${newCoupon.code}`,
            });
        } catch (error) {
            toast.error("Gagal membuat kupon");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle edit coupon
    const handleEditCoupon = async () => {
        if (!selectedCoupon) return;

        setIsLoading(true);
        try {
            const updatedCoupons = coupons.map((coupon) =>
                coupon.id === selectedCoupon.id
                    ? {
                          ...coupon,
                          ...formData,
                          updatedAt: new Date().toISOString().split("T")[0],
                      }
                    : coupon
            );

            setCoupons(updatedCoupons);
            setIsEditDialogOpen(false);
            setSelectedCoupon(null);
            resetForm();
            toast.success("Kupon berhasil diperbarui!");
        } catch (error) {
            toast.error("Gagal memperbarui kupon");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete coupon
    const handleDeleteCoupon = async (couponId: string) => {
        setIsLoading(true);
        try {
            setCoupons(coupons.filter((coupon) => coupon.id !== couponId));
            toast.success("Kupon berhasil dihapus!");
        } catch (error) {
            toast.error("Gagal menghapus kupon");
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
        toast.success("Kode kupon disalin!");
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
                                    className="border-slate-600 text-slate-900 hover:text-white hover:bg-slate-700"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleCreateCoupon}
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-900 hover:to-blue-500"
                                >
                                    {isLoading ? "Membuat..." : "Buat Kupon"}
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
                                className="border-slate-600"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
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
                            Kelola semua kupon diskon Anda
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
                                    {filteredCoupons.map((coupon) => (
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
                                                            {coupon.maxUsage}
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
                                                ).toLocaleDateString("id-ID")}
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
                                                                    Hapus Kupon
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400">
                                                                    Apakah Anda
                                                                    yakin ingin
                                                                    menghapus
                                                                    kupon "
                                                                    {
                                                                        coupon.name
                                                                    }
                                                                    "? Tindakan
                                                                    ini tidak
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
                                                                            coupon.id
                                                                        )
                                                                    }
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
                            {" "}
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
                                {isLoading
                                    ? "Menyimpan..."
                                    : "Simpan Perubahan"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
