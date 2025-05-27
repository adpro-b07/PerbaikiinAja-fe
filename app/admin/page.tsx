"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showCreateTeknisiModal, setShowCreateTeknisiModal] = useState(false);

  // Form state for creating new technician
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    password: "",
    noTelp: "",
    alamat: "",
  });

    useEffect(() => {
    // Check if user is logged in and has appropriate role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user || !user.role) {
        // No user, redirect to login
        router.replace('/login');
        return;
    } else if (user.role.toLowerCase() !== 'admin') {
        // User exists but wrong role, redirect to forbidden
        router.replace('/forbidden');
        return;
    }
    
    // Proceed with normal page loading
    fetchData();
    }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateTeknisi = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: "teknisi",
        }),
        credentials: "include",
      });

      if (response.ok) {
        toast.success(`Teknisi ${formData.namaLengkap} telah berhasil dibuat!`);
        
        // Reset form and close modal
        setFormData({
          namaLengkap: "",
          email: "",
          password: "",
          noTelp: "",
          alamat: "",
        });
        setShowCreateTeknisiModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create technician");
      }
    } catch (error) {
      console.error("Error creating technician:", error);
      toast.error(error instanceof Error ? error.message : "Gagal membuat teknisi. Silakan coba lagi.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10316B]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#FFFFFF',
            color: '#333333',
          },
          success: {
            style: {
              border: '1px solid #10b981',
              padding: '16px',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
              padding: '16px',
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-[#10316B] text-white p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">PerbaikiinAja Admin</h1>
          <Button 
            variant="outline" 
            className="bg-white text-[#10316B] hover:bg-gray-100"
            onClick={() => {
              localStorage.removeItem('user');
              router.push('/login');
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-8">
        <h2 className="text-xl font-semibold text-[#10316B]">Dashboard Admin</h2>
        
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-[#10316B]/20 hover:border-[#10316B]/50 transition-all">
            <h3 className="text-lg font-medium text-[#10316B] mb-4">Manajemen Kupon</h3>
            <p className="text-gray-600 mb-4">Kelola kupon diskon untuk pengguna PerbaikiinAja.</p>
            <Button 
              className="w-full bg-[#10316B] hover:bg-[#0B2552]"
              onClick={() => router.push('/coupons')}
            >
              Buka Halaman Kupon
            </Button>
          </Card>
          
          <Card className="p-6 border-2 border-[#10316B]/20 hover:border-[#10316B]/50 transition-all">
            <h3 className="text-lg font-medium text-[#10316B] mb-4">Tambah Teknisi</h3>
            <p className="text-gray-600 mb-4">Daftarkan teknisi baru ke dalam sistem.</p>
            <Button 
              className="w-full bg-[#10316B] hover:bg-[#0B2552]"
              onClick={() => setShowCreateTeknisiModal(true)}
            >
              Tambah Teknisi Baru
            </Button>
          </Card>
          
            <Card className="p-6 border-2 border-[#10316B]/20 hover:border-[#10316B]/50 transition-all">
                <h3 className="text-lg font-medium text-[#10316B] mb-4">Manajemen Ulasan</h3>
                <p className="text-gray-600 mb-4">Lihat dan kelola ulasan dari pengguna PerbaikiinAja.</p>
                <Button 
                    className="w-full bg-[#10316B] hover:bg-[#0B2552]"
                    onClick={() => router.push('/admin/reports')}
                >
                    Kelola Ulasan
                </Button>
            </Card>
        </div>
      </div>

      {/* Create Teknisi Modal */}
      {showCreateTeknisiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-[#10316B] mb-4">Tambah Teknisi Baru</h2>
            
            <form onSubmit={handleCreateTeknisi} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="namaLengkap"
                  value={formData.namaLengkap}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10316B]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10316B]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10316B]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <input
                  type="tel"
                  name="noTelp"
                  value={formData.noTelp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10316B]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10316B]"
                  rows={3}
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateTeknisiModal(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#10316B] hover:bg-[#0B2552]"
                >
                  Tambah Teknisi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}