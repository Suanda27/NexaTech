export default function CategoryTable() {
  const data = [
    { name: "Elektronik", total: 128, status: "Active" },
    { name: "Fashion", total: 86, status: "Active" },
    { name: "Makanan & Minuman", total: 54, status: "Inactive" },
    { name: "Peralatan Rumah", total: 37, status: "Active" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
      <table className="min-w-[560px] w-full text-sm">
        
        {/* Head */}
        <thead>
          <tr className="text-gray-400 border-b">
            <th className="text-left pb-3">Nama Kategori</th>
            <th className="text-left pb-3">Jumlah Produk</th>
            <th className="text-left pb-3">Status</th>
            <th className="text-left pb-3">Aksi</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b last:border-none">
              
              <td className="py-4 text-gray-700">
                {item.name}
              </td>

              <td className="text-gray-600">
                {item.total}
              </td>

              <td>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    item.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {item.status}
                </span>
              </td>

              <td className="space-x-2">
                <button className="bg-blue-100 hover:bg-blue-200 text-blue-500 px-2 py-1 rounded-md">
                  ✏️
                </button>
                <button className="bg-red-100 hover:bg-red-200 text-red-500 px-2 py-1 rounded-md">
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
