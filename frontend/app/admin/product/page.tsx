import ProductTable from "./ProductTable";

export default function ProductPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Produk
          </h1>
          <p className="text-gray-500 text-sm">
            Kelola semua produk
          </p>
        </div>

        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm">
          + Tambah Produk
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Cari nama produk"
          className="flex-1 px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select className="px-4 py-2 border rounded-lg text-sm">
          <option>Semua Kategori</option>
          <option>Elektronik</option>
          <option>Fashion</option>
        </select>
      </div>

      {/* Table */}
      <ProductTable />
    </div>
  );
}