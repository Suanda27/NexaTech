import CategoryTable from "./CategoryTable";

export default function CategoryPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Kategori
          </h1>
          <p className="text-gray-500 text-sm">
            Kelola semua kategori produk
          </p>
        </div>

        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm">
          + Tambah Kategori
        </button>
      </div>

      {/* Table */}
      <CategoryTable />
    </div>
  );
}