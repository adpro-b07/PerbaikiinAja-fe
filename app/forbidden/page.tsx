"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { useEffect } from 'react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="h-16 w-16 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#10316B]">Akses Ditolak</h1>
          
          <div className="bg-red-50 text-red-700 text-sm py-1 px-3 rounded-full font-semibold">
            Error 403: Forbidden
          </div>
          
          <p className="text-gray-600 mt-2">
            Anda tidak memiliki izin untuk mengakses halaman ini. 
            Silakan login dengan akun yang sesuai atau kembali ke halaman utama.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          
          <Button 
            className="flex-1 gap-2 bg-[#10316B] hover:bg-[#0b264d]"
            onClick={() => router.push('/login')}
          >
            Login
          </Button>
          
          <Button 
            className="flex-1 gap-2 bg-[#10316B] hover:bg-[#0b264d]"
            onClick={() => router.push('/home')}
          >
            <Home className="h-4 w-4" />
            Beranda
          </Button>
        </div>
      </div>
    </main>
  );
}