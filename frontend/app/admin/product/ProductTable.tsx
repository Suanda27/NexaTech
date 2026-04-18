"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import EditProductModal from "./components/EditProductModal";
import DeleteProductModal from "./components/DeleteProductModal";

export default function ProductTable() {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // 🔥 close saat klik luar & ESC
  useEffect(() => {
    const handleClickOutside = () => setActivePopover(null);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActivePopover(null);
    };

    window.addEventListener("click", handleClickOutside);
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const data = [
    {
      name: "Sepatu Sprint X",
      sku: "PRD-2031",
      category: "Fashion",
      price: "Rp 799.000",
      desc: "Alat paling dan bermanfaat, sangat cocok digunakan dalam berbagai kondisi karena fleksibel dan tahan lama.",
      spec: "Material premium, tahan air, ringan, ukuran fleksibel, desain ergonomis.",
      stock: 124,
      status: "Active",
    },
    {
      name: "Bottle Flow",
      sku: "PRD-1874",
      category: "Aksesoris",
      price: "Rp 249.000",
      desc: "-",
      spec: "-",
      stock: 0,
      status: "Out",
    },
    {
      name: "Audio Wave Pro",
      sku: "PRD-1199",
      category: "Elektronik",
      price: "Rp 1.299.000",
      desc: "-",
      spec: "-",
      stock: 56,
      status: "Active",
    },
    {
      name: "Chair Flexi",
      sku: "PRD-1640",
      category: "Furniture",
      price: "Rp 2.150.000",
      desc: "-",
      spec: "-",
      stock: 18,
      status: "Active",
    },
  ];

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-200">
        <table className="min-w-[900px] w-full text-sm">

          <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
            <tr className="text-gray-700 text-xs uppercase tracking-wide font-semibold">
              <th className="px-6 py-4 text-left">Gambar</th>
              <th className="px-6 py-4 text-left">Produk</th>
              <th className="px-6 py-4 text-left">Kategori</th>
              <th className="px-6 py-4 text-left">Harga</th>
              <th className="px-6 py-4 text-left">Deskripsi</th>
              <th className="px-6 py-4 text-left">Spesifikasi</th>
              <th className="px-6 py-4 text-center">Stok</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">

                {/* Gambar */}
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 text-xs font-medium">
                    IMG
                  </div>
                </td>

                {/* Produk */}
                <td className="px-6 py-4">
                  <div className="max-w-[180px]">
                    <p className="font-medium text-gray-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      SKU: {item.sku}
                    </p>
                  </div>
                </td>

                {/* Kategori */}
                <td className="px-6 py-4 text-gray-600">{item.category}</td>

                {/* Harga */}
                <td className="px-6 py-4 font-medium text-gray-700 whitespace-nowrap">
                  {item.price}
                </td>

                {/* 🔥 DESKRIPSI */}
                <td className="px-6 py-4 max-w-[180px] relative">
                  <p
                    className="text-gray-500 truncate cursor-pointer"
                    onMouseEnter={() => setHovered(`desc-${i}`)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopover(
                        activePopover === `desc-${i}` ? null : `desc-${i}`
                      );
                    }}
                  >
                    {item.desc}
                  </p>

                  {(hovered === `desc-${i}` ||
                    activePopover === `desc-${i}`) && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute z-50 mt-2 w-64 p-3 text-sm text-gray-700 bg-white border rounded-xl shadow-xl transition"
                    >
                      {item.desc}
                    </div>
                  )}
                </td>

                {/* 🔥 SPESIFIKASI */}
                <td className="px-6 py-4 max-w-[180px] relative">
                  <p
                    className="text-gray-500 truncate cursor-pointer"
                    onMouseEnter={() => setHovered(`spec-${i}`)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopover(
                        activePopover === `spec-${i}` ? null : `spec-${i}`
                      );
                    }}
                  >
                    {item.spec}
                  </p>

                  {(hovered === `spec-${i}` ||
                    activePopover === `spec-${i}`) && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute z-50 mt-2 w-64 p-3 text-sm text-gray-700 bg-white border rounded-xl shadow-xl transition"
                    >
                      {item.spec}
                    </div>
                  )}
                </td>

                {/* Stok */}
                <td
                  className={`px-6 py-4 text-center font-medium ${
                    item.stock === 0 ? "text-red-500" : "text-gray-800"
                  }`}
                >
                  {item.stock}
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      item.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.status === "Active" ? "Active" : "Out"}
                  </span>
                </td>

                {/* Aksi */}
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelected(item);
                        setEditOpen(true);
                      }}
                      className="p-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setSelected(item);
                        setDeleteOpen(true);
                      }}
                      className="p-2 rounded-md bg-red-50 hover:bg-red-100 text-red-500"
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

      <EditProductModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        product={selected}
      />

      <DeleteProductModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          console.log("Delete:", selected);
          setDeleteOpen(false);
        }}
        product={selected}
      />
    </>
  );
}