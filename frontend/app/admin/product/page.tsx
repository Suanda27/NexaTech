import ProductTable from "./ProductTable";

export default function ProductPage() {
  return (
    <div className="p-4 bg-gray-100 min-h-screen sm:p-6">

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="flex flex-col gap-3 mb-5 sm:flex-row">
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
