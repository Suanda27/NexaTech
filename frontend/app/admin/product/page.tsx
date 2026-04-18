"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ProductTable from "./ProductTable";
import AddProductModal from "./components/AddProductModal";

export default function ProductPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4 bg-blue-50 min-h-screen sm:p-6">

      {/* WRAPPER */}
      <div className="max-w-7xl mx-auto">

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

          <button
            onClick={() => setOpen(true)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg shadow-sm transition active:scale-95"
          >
            + Tambah Produk
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-3 mb-5 sm:flex-row">

          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari nama produk..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
            />

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Filter */}
          <select className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none">
            <option>Semua Kategori</option>
            <option>Elektronik</option>
            <option>Fashion</option>
          </select>
        </div>

        {/* Table */}
        <ProductTable />

      </div>

      {/* Modal */}
      <AddProductModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}