"use client";

interface Props {
    reason: string;
    setReason: (val: string) => void;
    onSubmit: () => void;
    onBack: () => void;
}

export default function CancelSection({
    reason,
    setReason,
    onSubmit,
    onBack,
}: Props) {
    return (
        <div className="space-y-3">
            <textarea
                placeholder="Enter your reason for cancellation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="flex gap-3">
                <button
                    onClick={onSubmit}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition"
                >
                    Submit Cancel
                </button>

                <button
                    onClick={onBack}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 py-3 rounded-xl font-medium transition"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
