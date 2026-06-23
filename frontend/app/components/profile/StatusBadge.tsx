export default function StatusBadge({ status }: { status: string }) {
    const color =
        status === "Processing"
            ? "bg-blue-100 text-blue-600"
            : status === "Completed"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600";

    return <span className={`px-3 py-1 rounded ${color}`}>{status}</span>;
}
