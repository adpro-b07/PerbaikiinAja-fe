// API service untuk menghubungkan dengan backend Spring Boot
const API_BASE_URL = "https://perbaikiinaja.koyeb.app";

// Interface untuk backend Kupon model
interface BackendKupon {
    id: string;
    kodeKupon: string;
    potongan: number;
    batasPemakaian: number;
    // Kemungkinan ada field tambahan yang dikembalikan backend
    jumlahTerpakai?: number; // untuk tracking penggunaan kupon
    aktif?: boolean; // untuk status aktif/tidak aktif
}

// Interface untuk frontend Coupon model (dari komponen yang sudah ada)
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

// Mapping function dari backend ke frontend
function mapBackendToFrontend(backendKupon: BackendKupon): Coupon {
    return {
        id: backendKupon.id,
        code: backendKupon.kodeKupon,
        name: backendKupon.kodeKupon, // Menggunakan kode sebagai nama karena backend tidak punya field name
        description: `Kupon diskon ${backendKupon.potongan}%`, // Generate description
        discountType: "percentage", // Asumsi backend selalu percentage karena field "potongan"
        discountValue: backendKupon.potongan,
        maxUsage: backendKupon.batasPemakaian,
        currentUsage: backendKupon.jumlahTerpakai || 0, // Gunakan data dari backend jika ada
        minOrderAmount: 0, // Backend tidak punya field ini, set ke 0
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // Default 30 hari dari sekarang
        isActive:
            backendKupon.aktif !== undefined
                ? backendKupon.aktif
                : backendKupon.batasPemakaian >
                  (backendKupon.jumlahTerpakai || 0), // Cek status aktif
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
    };
}

// Mapping function dari frontend ke backend untuk create/update
// Hanya kirim 3 field yang diterima backend
function mapFrontendToBackend(coupon: Partial<Coupon>) {
    return {
        kodeKupon: coupon.code || "",
        potongan: coupon.discountValue || 0,
        batasPemakaian: coupon.maxUsage || 0,
    };
}

export class CouponAPI {
    // Get all coupons
    static async getAllCoupons(): Promise<Coupon[]> {
        try {
            console.log("Fetching coupons from:", `${API_BASE_URL}/api/kupon`);

            const response = await fetch(`${API_BASE_URL}/api/kupon`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                // Tambahkan timeout dan retry logic
            });

            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Backend error response:", errorText);
                throw new Error(
                    `HTTP error! status: ${response.status} - ${errorText}`
                );
            }

            const backendCoupons: BackendKupon[] = await response.json();
            console.log("Backend coupons received:", backendCoupons);

            return backendCoupons.map(mapBackendToFrontend);
        } catch (error) {
            console.error("Error fetching coupons:", error);

            // Jika network error, kembalikan array kosong dengan pesan
            if (error instanceof TypeError && error.message.includes("fetch")) {
                console.warn(
                    "Network error - server mungkin sedang cold start"
                );
                throw new Error(
                    "Server sedang starting up, coba lagi dalam beberapa detik"
                );
            }

            throw error;
        }
    }

    // Get active coupons
    static async getActiveCoupons(): Promise<Coupon[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/kupon/active`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const backendCoupons: BackendKupon[] = await response.json();
            return backendCoupons.map(mapBackendToFrontend);
        } catch (error) {
            console.error("Error fetching active coupons:", error);
            throw error;
        }
    }

    // Get inactive coupons
    static async getInactiveCoupons(): Promise<Coupon[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/kupon/inactive`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const backendCoupons: BackendKupon[] = await response.json();
            return backendCoupons.map(mapBackendToFrontend);
        } catch (error) {
            console.error("Error fetching inactive coupons:", error);
            throw error;
        }
    }

    // Get coupon by code
    static async getCouponByCode(code: string): Promise<Coupon> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/kupon/${code}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const backendCoupon: BackendKupon = await response.json();
            return mapBackendToFrontend(backendCoupon);
        } catch (error) {
            console.error("Error fetching coupon by code:", error);
            throw error;
        }
    }

    // Create new coupon - hanya kirim 3 field yang diterima backend
    static async createCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
        try {
            const backendData = mapFrontendToBackend(couponData);

            console.log("Sending data to backend:", backendData); // Debug log

            const response = await fetch(`${API_BASE_URL}/api/kupon/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(backendData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Backend error response:", errorText);
                throw new Error(
                    `HTTP error! status: ${response.status} - ${errorText}`
                );
            }

            const backendCoupon: BackendKupon = await response.json();
            return mapBackendToFrontend(backendCoupon);
        } catch (error) {
            console.error("Error creating coupon:", error);
            throw error;
        }
    }

    // Update coupon - hanya kirim 3 field yang diterima backend
    static async updateCoupon(
        code: string,
        couponData: Partial<Coupon>
    ): Promise<Coupon> {
        try {
            const backendData = mapFrontendToBackend(couponData);

            console.log("Updating coupon with data:", backendData); // Debug log

            const response = await fetch(
                `${API_BASE_URL}/api/kupon/update/${code}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(backendData),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Backend error response:", errorText);
                throw new Error(
                    `HTTP error! status: ${response.status} - ${errorText}`
                );
            }

            const backendCoupon: BackendKupon = await response.json();
            return mapBackendToFrontend(backendCoupon);
        } catch (error) {
            console.error("Error updating coupon:", error);
            throw error;
        }
    }

    // Delete coupon
    static async deleteCoupon(code: string): Promise<void> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/kupon/delete/${code}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Backend error response:", errorText);
                throw new Error(
                    `HTTP error! status: ${response.status} - ${errorText}`
                );
            }
        } catch (error) {
            console.error("Error deleting coupon:", error);
            throw error;
        }
    }
}

export type { Coupon, BackendKupon };
