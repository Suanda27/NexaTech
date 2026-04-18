"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import EditCategoryModal from "./components/EditCategoryModal";
import DeleteCategoryModal from "./components/DeleteCategoryModal";

export default function CategoryTable() {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const data = [
    { name: "Elektronik", total: 128, status: "Active" },
    { name: "Fashion", total: 86, status: "Active" },
    { name: "Makanan & Minuman", total: 54, status: "Inactive" },
    { name: "Peralatan Rumah", total: 37, status: "Active" },
  ];

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-200">
        <table className="min-w-full text-sm">

          {/* Head */}
          <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
            <tr className="text-gray-700 text-xs uppercase tracking-wide font-semibold">
              <th className="text-left px-6 py-4">Nama Kategori</th>
              <th className="text-left px-6 py-4">Jumlah Produk</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Aksi</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-50 transition duration-150"
              >
                {/* Nama */}
                <td className="px-6 py-4 font-medium text-gray-800">
                  {item.name}
                </td>

                {/* Jumlah */}
                <td className="px-6 py-4 text-gray-600">
                  {item.total}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      item.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Aksi */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setSelected(item);
                        setEditOpen(true);
                      }}
                      className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition duration-150 active:scale-95"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        setSelected(item);
                        setDeleteOpen(true);
                      }}
                      className="p-2 rounded-md bg-red-50 hover:bg-red-100 text-red-500 transition duration-150 active:scale-95"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit */}
      <EditCategoryModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        category={selected}
      />

      {/* Modal Delete */}
      <DeleteCategoryModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          console.log("Hapus:", selected);
          setDeleteOpen(false);
        }}
        category={selected}
      />
    </>
  );
}