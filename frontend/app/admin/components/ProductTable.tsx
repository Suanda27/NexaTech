const products = [
    { name: "Laptop Sleeve", sold: 124, stock: 39 },
    { name: "Desk Lamp", sold: 318, stock: 39 },
    { name: "Notebook", sold: 86, stock: 12 },
];

export default function ProductTable() {
    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm sm:p-6">
            <h3 className="font-bold mb-4">Produk Penjualan</h3>

            {products.map((p, i) => (
                <div
                    key={i}
                    className="flex flex-wrap justify-between gap-2 py-2 border-b text-sm"
                >
                    <span>{p.name}</span>
                    <span>{p.sold}</span>
                    <span className="text-blue-500">{p.stock}</span>
                </div>
            ))}
        </div>
    );
}
