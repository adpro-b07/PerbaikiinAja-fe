"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Trash, Star, ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is logged in and is an admin
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
    fetchReports();
  }, [router]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/report', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Gagal memuat laporan ulasan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    
    try {
      const response = await fetch(`/api/report/delete/${selectedReport.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      
      setReports(reports.filter(report => report.id !== selectedReport.id));
      toast.success('Laporan ulasan berhasil dihapus');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Gagal menghapus laporan ulasan');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedReport(null);
    }
  };

  const openDeleteDialog = (report: any) => {
    setSelectedReport(report);
    setIsDeleteDialogOpen(true);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.ulasan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      report.pesanan?.emailPengguna.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.pesanan?.emailTeknisi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(report.pesanan?.id).includes(searchTerm);
    
    const matchesRating = filterRating === null || report.rating === filterRating;
    
    return matchesSearch && matchesRating;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-[#10316B] text-white p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manajemen Laporan Ulasan</h1>
          <Button 
            variant="outline" 
            className="bg-white text-[#10316B] hover:bg-gray-100"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#10316B]">Daftar Laporan Ulasan</h2>
                <p className="text-sm text-gray-500">Menampilkan semua ulasan dari pengguna</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Cari ulasan..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select 
                  className="p-2 border rounded-md text-sm w-full sm:w-auto"
                  value={filterRating === null ? '' : filterRating}
                  onChange={(e) => setFilterRating(e.target.value === '' ? null : Number(e.target.value))}
                >
                  <option value="">Semua Rating</option>
                  <option value="1">⭐ 1 Bintang</option>
                  <option value="2">⭐⭐ 2 Bintang</option>
                  <option value="3">⭐⭐⭐ 3 Bintang</option>
                  <option value="4">⭐⭐⭐⭐ 4 Bintang</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Bintang</option>
                </select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10316B]"></div>
                <span className="ml-3 text-gray-500">Memuat data...</span>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                {searchTerm || filterRating !== null ? 
                  'Tidak ada ulasan yang sesuai dengan filter' : 
                  'Belum ada laporan ulasan'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pesanan</TableHead>
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Teknisi</TableHead>
                      <TableHead>Ulasan</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">#{report.pesanan?.id || '-'}</TableCell>
                        <TableCell>{report.pesanan?.emailPengguna || '-'}</TableCell>
                        <TableCell>{report.pesanan?.emailTeknisi || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{report.ulasan}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-1">{report.rating}</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(report.createdAt)}</TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => openDeleteDialog(report)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Ulasan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus ulasan ini? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReport}
              className="bg-red-500 hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}