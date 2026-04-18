"use client";

import { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: any; // nanti bisa kamu typing lebih proper
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  category,
}: Props) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setStatus(category.status || "Active");
    }
  }, [category]);

  if (!isOpen) return null;

  const handleClose = () => {
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
            Edit Kategori
          </h2>
          <button
            onClick={handleClose}
            className="text-xl text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Nama Kategori
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

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
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Batal
          </button>

          <button
            disabled={isDisabled}
            className={`rounded-lg px-4 py-2 text-white
              ${
                isDisabled
                  ? "bg-blue-400 opacity-70 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}