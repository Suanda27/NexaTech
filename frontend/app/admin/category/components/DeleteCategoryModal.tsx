"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: any;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  category,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Hapus Kategori
        </h2>

        <p className="text-sm text-gray-600">
          Yakin ingin menghapus kategori{" "}
          <span className="font-semibold text-gray-800">
            {category?.name}
          </span>
          ?
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}