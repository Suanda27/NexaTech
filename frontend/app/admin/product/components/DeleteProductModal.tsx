"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: any;
}

export default function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-[90%] max-w-md rounded-2xl shadow-xl p-6 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Hapus Produk
        </h2>

        {/* Desc */}
        <p className="text-sm text-gray-600 mb-6">
          Apakah kamu yakin ingin menghapus produk{" "}
          <span className="font-semibold text-gray-800">
            {product?.name}
          </span>
          ?
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}