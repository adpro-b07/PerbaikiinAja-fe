'use client'

import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Wrench, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const services = [
  { name: "Handphone", image: "https://cdn.rri.co.id/berita/Palangkaraya/o/1733357402136-hand-holding-shattered-smart-phone-communication-lost-generated-by-ai/g2r4uve7vefbipk.jpeg" },
  { name: "Laptop", image: "https://i1.wp.com/success-comp.com/wp-content/uploads/2021/04/LCD-Laptop-Terdistorsi-Sumber-Dell.jpeg?ssl=1" },
  { name: "AC", image: "https://blog-asset.jakartanotebook.com/2023/09/white-air-conditioning-stream-fr.webp" },
  { name: "Kipas", image: "https://media.dinomarket.com/docs/imgTD/2021-10/DM_92206C02C50CCBABD6AF02A01DE05523_181021131030_ll.jpg.jpg" },
  { name: "Printer", image: "https://www.brother.co.id/-/media/ap2/products/printer/hl-t4000dw/hl-t4000dw-r.jpg?rev=56a09e176700426eb894262e2cc9408e" },
  { name: "TV", image: "https://aquaelektronik.com/upload_files/1/4b5d11d75a-tv-3.jpg" },
  { name: "Kulkas", image: "https://www.globalelektronik.com/wp-content/uploads/2021/10/SJ-237ND-AP.jpg" },
];

const recentOrders = [
  { technician: "Teknisi A", date: "02/05/2025", color: "bg-[#FFCE63]" },
  { technician: "Teknisi B", date: "02/05/2025", color: "bg-[#0B409C]" },
];

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [jumlahPesanan, setJumlahPesanan] = useState(0);
    const [username, setUsername] = useState("User");
    const [userEmail, setUserEmail] = useState("");
    const [recentReviews, setRecentReviews] = useState<any[]>([]);
    const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
    })
    const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
    const scrollNext = () => emblaApi && emblaApi.scrollNext();

    const fetchJumlahPesanan = async () => {
        try {
            const response = await fetch(`/api/user/jumlah-pesanan`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include' // Penting!
            });
            
            if (response.ok) {
            const data = await response.json();
            setJumlahPesanan(data || 0);
            }
        } catch (error) {
            setJumlahPesanan(0);
        }
    };
    
    const fetchReviews = async (email: string) => {
        try {            
            // Fetch
            const response = await fetch(`/api/report/pengguna/${encodeURIComponent(email)}`, {
                credentials: 'include',
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Sort
                const sortedReviews = Array.isArray(data) ? 
                    [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 2) : 
                    [];

                setRecentReviews(sortedReviews);
            } else {
                setRecentReviews([]);
            }
        } catch (error) {
            setRecentReviews([]);
        }
    };
  
    useEffect(() => {
    const checkAuth = async () => {
        try {
        // Panggil endpoint untuk memeriksa session
        const response = await fetch('/api/user/session', {
            credentials: 'include' // Penting!
        });
        
        if (!response.ok) {
            // Jika session tidak valid, redirect ke login
            router.replace('/login');
            return;
        }
        
        // Session valid, ambil data user
        const userData = await response.json();
        setUsername(userData.namaLengkap);
        setUserEmail(userData.email);
        
        // Fetch jumlah pesanan
        fetchJumlahPesanan();
        
        // Fetch reviews 
        fetchReviews(userData.email);
        
        setLoading(false);
        } catch (error) {
        console.error("Auth check failed:", error);
        router.replace('/login');
        }
    };
    
    checkAuth();
    }, [router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10316B]"></div>
        </div>
      );
    }


  return (
    <main className="min-h-screen bg-white">
    {/* Navigation */}
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
    <div className="flex items-center gap-6">
        <Link href="/" className="text-[#10316B]">Home</Link>
        <Link href="/order" className="text-[#10316B]">Order</Link>
    </div>
    
        <div className="relative group">
            <Button className="bg-[#10316B] text-white hover:bg-[#0B409C]">
            Hi, {username}!
            </Button>
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pt-3">
            {/* Tambahkan div "jembatan" transparan antara button dan dropdown */}
            <div className="absolute top-[-10px] h-3 w-full bg-transparent"></div>
                <Button
                onClick={async () => {
                    try {
                    // Call the logout API endpoint
                    const response = await fetch('/api/user/logout', {
                        method: 'POST',
                        credentials: 'include', // Important to include cookies
                    });
                    
                    // Remove user from localStorage regardless of API response
                    localStorage.removeItem('user');
                    
                    // Redirect to login page
                    window.location.href = '/login';
                    } catch (error) {
                    console.error("Logout failed:", error);
                    // Still redirect to login page even if the API call fails
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    }
                }}
                variant="ghost"
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                Logout
                </Button>
            </div>
        </div>
    </nav>

{/* Services Section */}
      <section className="px-6 py-8 relative">
        <div className="overflow-hidden relative" ref={emblaRef}>
          <div className="flex gap-4">
            {services.map((service) => (
              <Card key={service.name} className="flex-shrink-0 w-48 overflow-hidden">
                <div className="relative h-32">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-medium">{service.name}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <Button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md z-10"
          size="icon"
          variant="ghost"
        >
          <ChevronLeft className="h-6 w-6 text-[#10316B]" />
        </Button>

        <Button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md z-10"
          size="icon"
          variant="ghost"
        >
          <ChevronRight className="h-6 w-6 text-[#10316B]" />
        </Button>
      </section>

      {/* Recent Orders */}
      <section className="px-6 py-8">
        <h2 className="text-xl font-semibold text-[#10316B] mb-4">Recent order</h2>
        <div className="space-y-4">
          {recentOrders.map((order, index) => (
            <div
              key={index}
              className={`${order.color} text-white p-4 rounded-lg flex items-center justify-between`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                <div>
                  <h3 className="font-medium">{order.technician}</h3>
                  <p className="text-sm">order by : {order.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right mt-4">
          <Button variant="link" className="text-[#10316B]">
            See More
          </Button>
        </div>
      </section>

      {/* Stats and Reviews */}
      <section className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-[#10316B] text-white">
          <h3 className="text-lg font-medium mb-4">Your Total Order</h3>
          <p className="text-6xl font-bold">{jumlahPesanan}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium text-[#10316B] mb-4">
            Rating dan Ulasan By User
          </h3>
          <div className="space-y-4">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div 
                  key={review.id} 
                  className="p-3 bg-gray-50 border border-gray-100 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium">Pesanan #{review.pesanan.id}</div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14}
                          className={`${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.ulasan}</p>
                </div>
              ))
            ) : (
              <>
                <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Belum ada ulasan</p>
                </div>
                <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Belum ada ulasan</p>
                </div>
              </>
            )}
          </div>
          <div className="text-right mt-4">
            <Link href="/review">
              <Button variant="link" className="text-[#10316B]">
                See More
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}