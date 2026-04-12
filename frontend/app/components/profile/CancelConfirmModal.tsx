"use client";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function CancelConfirmModal({ open, onOpenChange, onConfirm }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Are you sure you want to cancel this order?
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                    This action cannot be undone. Your order will be cancelled
                    and you'll need to place a new order if you change your
                    mind.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    >
                        No
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white transition"
                    >
                        Yes, Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
