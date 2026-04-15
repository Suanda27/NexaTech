export default function ProductTable() {
  const data = [
    {
      name: "Sepatu Sprint X",
      sku: "PRD-2031",
      category: "Fashion",
      price: "Rp 799.000",
      desc: "Alat paling dan bermanfaat",
      spec: "Alat paling dan bermanfaat",
      stock: 124,
      status: "Active",
    },
    {
      name: "Bottle Flow",
      sku: "PRD-1874",
      category: "Aksesoris",
      price: "Rp 249.000",
      desc: "-",
      spec: "-",
      stock: 0,
      status: "Out",
    },
    {
      name: "Audio Wave Pro",
      sku: "PRD-1199",
      category: "Elektronik",
      price: "Rp 1.299.000",
      desc: "-",
      spec: "-",
      stock: 56,
      status: "Active",
    },
    {
      name: "Chair Flexi",
      sku: "PRD-1640",
      category: "Furniture",
      price: "Rp 2.150.000",
      desc: "-",
      spec: "-",
      stock: 18,
      status: "Active",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <table className="w-full text-sm">
        
        {/* Head */}
        <thead>
          <tr className="text-gray-400 border-b text-left">
            <th className="pb-3">Gambar</th>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Deskripsi</th>
            <th>Spesifikasi</th>
            <th>Stok</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-b last:border-none">

              {/* Image */}
              <td className="py-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </td>

              {/* Name */}
              <td>
                <p className="font-medium text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-400">SKU: {item.sku}</p>
              </td>

              <td>{item.category}</td>
              <td className="font-medium">{item.price}</td>
              <td className="text-gray-500">{item.desc}</td>
              <td className="text-gray-500">{item.spec}</td>
              <td>{item.stock}</td>

              {/* Status */}
              <td>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    item.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {item.status === "Active" ? "Active" : "Out of Stock"}
                </span>
              </td>

              {/* Action */}
              <td className="space-x-2">
                <button className="bg-blue-100 text-blue-500 px-2 py-1 rounded-md">
                  ✏️
                </button>
                <button className="bg-red-100 text-red-500 px-2 py-1 rounded-md">
                  🗑️
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}