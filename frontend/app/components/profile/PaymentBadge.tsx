export default function PaymentBadge({ isProcessing }: { isProcessing: boolean }) {
    return (
        <span
            className={`px-2 py-1 text-sm rounded ${
                isProcessing ? "bg-green-100 text-green-700" : "bg-gray-200"
            }`}
        >
            {isProcessing ? "Processing" : "Waiting Payment"}
        </span>
    );
}
