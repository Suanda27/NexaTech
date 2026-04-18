const products = [
    { name: "Laptop Sleeve", sold: 124, stock: 39 },
    { name: "Desk Lamp", sold: 318, stock: 39 },
    { name: "Notebook", sold: 86, stock: 12 },
];

export default function ProductTable() {
    return (
        <div className="space-y-4">
            {products.map((p, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between rounded-3xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-sm transition hover:bg-blue-100"
                >
                    <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-blue-600">{p.sold} sold</p>
                    </div>
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            p.stock > 20
                                ? "bg-emerald-100 text-emerald-700"
                                : p.stock > 10
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                        }`}
                    >
                        {p.stock} left
                    </span>
                </div>
            ))}
        </div>
    );
}
