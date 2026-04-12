export default function PaymentBadge({ isPaid }: any) {
    return (
        <span
            className={`px-2 py-1 text-sm rounded ${
                isPaid ? "bg-green-100 text-green-700" : "bg-gray-200"
            }`}
        >
            {isPaid ? "Paid" : "Unpaid"}
        </span>
    );
}
