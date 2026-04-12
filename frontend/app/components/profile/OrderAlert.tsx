export default function OrderAlert({ type, reason }: any) {
    return (
        <div className="bg-red-50 border border-red-200 p-3 rounded text-red-600">
            <strong>
                {type === "declined" ? "Order Declined:" : "Cancelled:"}
            </strong>{" "}
            {reason}
        </div>
    );
}
