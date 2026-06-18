export type Language = "id" | "en";

export const languageNames: Record<Language, string> = {
    id: "Indonesia",
    en: "English",
};

export const defaultLanguage: Language = "id";

export const translations: Record<string, string> = {
    "Search products...": "Cari produk...",
    "Search admin panel...": "Cari di panel admin...",
    Login: "Masuk",
    Register: "Daftar",
    Products: "Produk",
    Product: "Produk",
    "Order History": "Riwayat Pesanan",
    "Personal Info": "Info Pribadi",
    Logout: "Keluar",
    "Sign Out": "Keluar",
    Account: "Akun",
    "Signed in": "Sudah masuk",
    Customer: "Pelanggan",
    Admin: "Admin",
    Administrator: "Administrator",
    Staff: "Staf",
    "Team Member": "Anggota Tim",
    "Toggle sidebar": "Buka/tutup sidebar",
    "Admin Menu": "Menu Admin",
    "Commerce control center": "Pusat kendali toko",
    "Hello,": "Halo,",
    Dashboard: "Dasbor",
    "Manajemen Order": "Manajemen Order",
    "Your Cart": "Keranjang Anda",
    "Shopping Cart": "Keranjang Belanja",
    "Start Shopping": "Mulai Belanja",
    Checkout: "Checkout",
    "Order Summary": "Ringkasan Pesanan",
    Total: "Total",
    "Proceed to Checkout": "Lanjut ke Checkout",
    "Secure payment": "Pembayaran aman",
    "Fast delivery": "Pengiriman cepat",
    "All Categories": "Semua Kategori",
    "Top seller": "Terlaris",
    "Strongest this week": "Paling kuat minggu ini",
    Active: "Aktif",
    Inactive: "Tidak Aktif",
    "Out of Stock": "Stok Habis",
    Pending: "Menunggu",
    Processing: "Diproses",
    Delivered: "Terkirim",
    Cancelled: "Dibatalkan",
    "Payment Status": "Status Pembayaran",
    "Waiting Payment": "Menunggu Pembayaran",
    Paid: "Dibayar",
    Unpaid: "Belum Dibayar",
    "Full Name": "Nama Lengkap",
    "Email Address": "Alamat Email",
    Password: "Kata Sandi",
    "Save Changes": "Simpan Perubahan",
    "Saving...": "Menyimpan...",
    "Yes, Cancel": "Ya, Batalkan",
    Cancel: "Batal",
    Save: "Simpan",
    Edit: "Edit",
    Delete: "Hapus",
    Add: "Tambah",
    "Why Choose NexaTech": "Mengapa Memilih NexaTech",
    "Premium Tech Collection": "Koleksi Teknologi Premium",
    "Upgrade Your Tech": "Tingkatkan Teknologi Anda",
    Experience: "Pengalaman",
    "Upgrade Your Tech Experience": "Tingkatkan Pengalaman Teknologi Anda",
    "Discover premium technology products designed to enhance your digital lifestyle. Quality, performance, and innovation in every device.":
        "Temukan produk teknologi premium yang dirancang untuk menunjang gaya hidup digital Anda. Kualitas, performa, dan inovasi di setiap perangkat.",
    "Explore Products": "Jelajahi Produk",
    "Modern tech workspace": "Ruang kerja teknologi modern",
    "Fast Delivery": "Pengiriman Cepat",
    "Secure Pay": "Pembayaran Aman",
    "Top Rated": "Rating Terbaik",
    "Premium Quality Products": "Produk Berkualitas Premium",
    "Secure Payment": "Pembayaran Aman",
    "Trusted Technology Store": "Toko Teknologi Tepercaya",
    "Experience excellence in every aspect of your technology journey":
        "Rasakan layanan terbaik di setiap langkah perjalanan teknologi Anda",
    "Lightning-fast shipping to get your tech products delivered when you need them most.":
        "Pengiriman cepat agar produk teknologi sampai saat Anda membutuhkannya.",
    "Curated selection of top-tier technology from leading brands worldwide.":
        "Pilihan teknologi terbaik dari merek unggulan dunia.",
    "Industry-leading encryption and security for all your transactions.":
        "Enkripsi dan keamanan terbaik untuk setiap transaksi Anda.",
    "Join thousands of satisfied customers who trust us for their tech needs.":
        "Bergabung dengan ribuan pelanggan yang mempercayakan kebutuhan teknologinya kepada kami.",
    "Featured Products": "Produk Unggulan",
    "Fresh product visuals from the live catalog.":
        "Tampilan produk terbaru dari katalog aktif.",
    "View All Products": "Lihat Semua Produk",
    "Recommended Products": "Rekomendasi Produk",
    "Recommended For You": "Rekomendasi Untuk Anda",
    "Personalized picks": "Pilihan personal",
    "Random picks": "Pilihan acak",
    "Browse Categories": "Jelajahi Kategori",
    "View Products": "Lihat Produk",
    Categories: "Kategori",
    Category: "Kategori",
    "Product Categories": "Kategori Produk",
    "Shop Now": "Belanja Sekarang",
    "View Details": "Lihat Detail",
    "Add to Cart": "Tambah ke Keranjang",
    "Buy Now": "Beli Sekarang",
    "Back to Home": "Kembali ke Beranda",
    Home: "Beranda",
    Profile: "Profil",
    Address: "Alamat",
    Phone: "Telepon",
    Name: "Nama",
    Email: "Email",
    Status: "Status",
    Action: "Aksi",
    Actions: "Aksi",
    Price: "Harga",
    Stock: "Stok",
    Description: "Deskripsi",
    Specifications: "Spesifikasi",
    Image: "Gambar",
    "Product Image": "Gambar Produk",
    "Customer Name": "Nama Pelanggan",
    "Order ID": "ID Pesanan",
    "ID Order": "ID Pesanan",
    "Payment Method": "Metode Pembayaran",
    "Order Date": "Tanggal Pesanan",
    "Tanggal Pemesan": "Tanggal Pesanan",
    "Language": "Bahasa",
    "No Image": "Tidak Ada Gambar",
    "All rights reserved.": "Hak cipta dilindungi.",
    Privacy: "Privasi",
    Terms: "Ketentuan",
    Contact: "Kontak",
    "Category Management": "Manajemen Kategori",
    "Product Management": "Manajemen Produk",
    "Order Management": "Manajemen Order",
    "Refined category management": "Manajemen kategori yang rapi",
    "Refined product management": "Manajemen produk yang rapi",
    "Catalog structure": "Struktur katalog",
    "Catalog operations": "Operasional katalog",
    "All categories now follow the database and admin CRUD API, so changes from this panel directly affect the customer catalog.":
        "Semua kategori sekarang mengikuti database dan CRUD API admin, jadi perubahan dari panel ini langsung memengaruhi katalog customer.",
    "All products, images, stock, and key specifications are now stored through the backend, so admin and customer read from the same data source.":
        "Semua produk, gambar, stok, dan key specification sekarang disimpan lewat backend, jadi admin dan customer membaca sumber data yang sama.",
    "Add Category": "Tambah Kategori",
    "Add Product": "Tambah Produk",
    "Total Categories": "Total Kategori",
    "Total Products": "Total Produk",
    "Inventory Value": "Nilai Inventori",
    "Total Stock": "Total Stok",
    "Category Directory": "Direktori Kategori",
    "Product Directory": "Direktori Produk",
    "Category List": "Daftar Kategori",
    "Product List": "Daftar Produk",
    "Category Name": "Nama Kategori",
    "Product Name": "Nama Produk",
    "Product Details": "Detail Produk",
    "Product Identity": "Identitas Produk",
    "Product Specification": "Spesifikasi Produk",
    "Key Specifications": "Spesifikasi Utama",
    "Performance Details": "Detail Performa",
    "Quick choices": "Pilihan cepat",
    "Quick category choices": "Pilihan kategori cepat",
    "Upload Image": "Upload Gambar",
    "Change Image": "Ganti Gambar",
    "Delete Image": "Hapus Gambar",
    "No image yet": "Belum ada gambar",
    "Category Image": "Gambar Kategori",
    "Product Directory": "Direktori Produk",
    "Category Directory": "Direktori Kategori",
    "Add Specification": "Tambah Spesifikasi",
    "Detail Specs": "Detail Specs",
    "Units Sold": "Unit Terjual",
    Revenue: "Pendapatan",
    Orders: "Pesanan",
    "Total Sales": "Total Penjualan",
    "Total Orders": "Total Order",
    "Sales Overview": "Ringkasan Penjualan",
    "Store Performance": "Performa Toko",
    "Best Sellers": "Produk Terlaris",
    "Top Products": "Produk Teratas",
    "Updated today": "Diperbarui hari ini",
    "Live admin overview": "Ringkasan admin live",
    "Welcome back,": "Selamat datang kembali,",
    "Monitor store performance, track growth, and keep your best-selling products in focus from one calm dashboard.":
        "Pantau performa toko, lacak pertumbuhan, dan jaga produk terlaris tetap terlihat dari satu dashboard yang rapi.",
    Conversion: "Konversi",
    Fulfillment: "Pemenuhan",
    "Live sync from orders": "Sinkron langsung dari order",
    "Orders processed on time": "Order diproses tepat waktu",
    "from delivered orders": "dari order terkirim",
    "current backend total": "total backend saat ini",
    "active catalog source": "sumber katalog aktif",
    "Revenue and order movement across the last six months.":
        "Pergerakan pendapatan dan order selama enam bulan terakhir.",
    "No sold products yet. Best seller data will appear from incoming orders.":
        "Belum ada produk terjual. Data best seller akan muncul dari order yang sudah masuk.",
    Best: "Terbaik",
    Details: "Detail",
    "Catalog grouping": "Pengelompokan katalog",
    "Please add a category": "Silahkan tambahkan kategori",
    "No categories are saved yet. Add a new category to start grouping products more neatly.":
        "Belum ada kategori yang tersimpan. Tambahkan kategori baru untuk mulai mengelompokkan produk dengan lebih rapi.",
    "Add New Category": "Tambahkan Kategori",
    "No products yet": "Belum ada produk",
    "Please add a new product so the admin catalog starts filling up and becomes more complete.":
        "Silahkan tambahkan produk baru agar katalog admin mulai terisi dan lebih lengkap.",
    "Add New Product": "Tambahkan Produk",
    "All Categories": "Semua Kategori",
    "All Statuses": "Semua Status",
    "Search product name, SKU, or description...":
        "Cari nama produk, SKU, atau deskripsi...",
    "Out of stock products": "Produk stok habis",
    "Low stock products": "Produk stok menipis",
    Previous: "Sebelumnya",
    Next: "Berikutnya",
    Page: "Halaman",
    Showing: "Menampilkan",
    "data entries": "data",
    "Save Category": "Simpan Kategori",
    "Update Category": "Update Kategori",
    "Delete Category": "Hapus Kategori",
    "Save Product": "Simpan Produk",
    "Update Product": "Update Produk",
    "Delete Product": "Hapus Produk",
    "Edit Category": "Edit Kategori",
    "Edit Product": "Edit Produk",
    "Create a new category so product grouping is more structured.":
        "Buat kategori baru agar pengelompokan produk lebih terstruktur.",
    "Update the category name and display status in the catalog.":
        "Perbarui nama kategori dan status tampilnya di katalog.",
    "This action will remove the category from the management list.":
        "Tindakan ini akan menghapus kategori dari daftar manajemen.",
    "Are you sure you want to delete category": "Yakin ingin menghapus kategori",
    "This category is currently linked to": "Kategori ini saat ini terkait dengan",
    "products": "produk",
    "This product will be removed from the product management list.":
        "Produk akan dihapus dari daftar manajemen produk.",
    "You are about to delete product": "Kamu akan menghapus produk",
    "This action cannot be undone from the admin view.":
        "Tindakan ini tidak bisa dibatalkan dari tampilan admin.",
    "Admin Sign In": "Masuk Admin",
    "Sign in to the NexaTech management dashboard.":
        "Masuk ke dashboard pengelolaan NexaTech.",
    "Enter your password": "Masukkan kata sandi",
    "Signing in...": "Sedang masuk...",
    "Login Admin": "Login Admin",
    "Back to": "Kembali ke",
    "main page": "halaman utama",
    "Admin login failed": "Login admin gagal",
    "Connection error occurred": "Terjadi kesalahan koneksi",
};

const reverseTranslations = Object.fromEntries(
    Object.entries(translations).map(([english, indonesia]) => [
        indonesia,
        english,
    ]),
) as Record<string, string>;

export function translateText(value: string, language: Language) {
    const leading = value.match(/^\s*/)?.[0] ?? "";
    const trailing = value.match(/\s*$/)?.[0] ?? "";
    const trimmed = value.trim();
    const normalized = trimmed.replace(/\s+/g, " ");

    if (!trimmed) {
        return value;
    }

    if (language === "en") {
        const translated =
            reverseTranslations[trimmed] ?? reverseTranslations[normalized];

        if (translated) {
            return `${leading}${translated}${trailing}`;
        }

        return value;
    }

    const translated = translations[trimmed] ?? translations[normalized];
    if (!translated) {
        if (normalized.includes("All rights reserved.")) {
            return `${leading}${normalized.replace(
                "All rights reserved.",
                "Hak cipta dilindungi.",
            )}${trailing}`;
        }

        return value;
    }

    return `${leading}${translated}${trailing}`;
}
