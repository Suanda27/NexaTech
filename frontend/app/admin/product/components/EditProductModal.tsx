"use client";

import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export default function EditProductModal({
  isOpen,
  onClose,
  product,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    desc: "",
    spec: "",
    status: "Active",
  });

  const [image, setImage] = useState<string | null>(null);

  // isi data saat modal dibuka
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        price: product.price || "",
        stock: product.stock || "",
        desc: product.desc || "",
        spec: product.spec || "",
        status: product.status || "Active",
      });
    }
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setImage(null);
    onClose();
  };

  const isValid =
    form.name && form.sku && form.category && form.price && form.stock;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleClose}
    >
      <div
        className="bg-white w-[95%] max-w-2xl rounded-2xl shadow-xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Produk
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama */}
          <div>
            <label className="text-sm text-gray-600">Nama Produk</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="text-sm text-gray-600">SKU</label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-800"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="text-sm text-gray-600">Kategori</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-800"
            >
              <option>Elektronik</option>
              <option>Fashion</option>
              <option>Furniture</option>
            </select>
          </div>

          {/* Harga */}
          <div>
            <label className="text-sm text-gray-600">Harga</label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-800"
            />
          </div>

          {/* Stok */}
          <div>
            <label className="text-sm text-gray-600">Stok</label>
            <input
              name="stock"
              value={form.stock}
              onChange={handleChange}
              type="number"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-800"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-800"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* Upload Gambar */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Gambar Produk</label>

            <label className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
              <span className="text-2xl text-blue-400">📁</span>

              <span className="text-sm text-blue-600 font-medium">
                Klik untuk ganti gambar
              </span>

              <span className="text-xs text-gray-400">
                PNG / JPG (max 2MB)
              </span>

              <input
                type="file"
                onChange={handleImage}
                className="hidden"
              />
            </label>

            {/* Preview */}
            {image && (
              <img
                src={image}
                alt="preview"
                className="mt-3 w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
            )}
          </div>

          {/* Deskripsi */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Deskripsi</label>
            <textarea
              name="desc"
              value={form.desc}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-800"
            />
          </div>

          {/* Spesifikasi */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Spesifikasi</label>
            <textarea
              name="spec"
              value={form.spec}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-800"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            Batal
          </button>

          <button
            disabled={!isValid}
            className={`px-4 py-2 rounded-lg text-white transition ${
              isValid
                ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
                : "bg-blue-400 opacity-70 cursor-not-allowed"
            }`}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}