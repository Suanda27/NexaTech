"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCategoryModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");

  if (!isOpen) return null;

  const handleClose = () => {
    setName("");
    setStatus("Active");
    onClose();
  };

  const isDisabled = !name.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleClose}
    >
      <div
        className="w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Tambah Kategori
          </h2>
          <button
            onClick={handleClose}
            className="text-xl text-gray-400 transition hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Nama */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Nama Kategori
            </label>
            <input
              type="text"
              placeholder="Contoh: Elektronik"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100"
          >
            Batal
          </button>

          <button
            disabled={isDisabled}
            className={`rounded-lg px-4 py-2 text-white transition
              ${
                isDisabled
                  ? "cursor-not-allowed bg-blue-400 opacity-70"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}