"use client";

import { useState } from "react";
import CategoryTable from "./CategoryTable";
import AddCategoryModal from "./components/AddCategoryModal";

export default function CategoryPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4 bg-blue-50 min-h-screen sm:p-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Kategori
          </h1>
          <p className="text-gray-500 text-sm">
            Kelola semua kategori produk
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg shadow-sm transition"
        >
          + Tambah Kategori
        </button>
      </div>

      {/* Table */}
      <CategoryTable />

      {/* Modal */}
      <AddCategoryModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}