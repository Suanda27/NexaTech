export default function OrderTable() {
  const data = [
    {
      id: "#ORD-1024",
      name: "Nabila Prameswari",
      date: "14 Jan 2026",
      total: "Rp1.250.000",
      payment: "COD",
      status: "Pending",
    },
    {
      id: "#ORD-1023",
      name: "Aditya Mahesa",
      date: "13 Jan 2026",
      total: "Rp780.000",
      payment: "COD",
      status: "Diproses",
    },
    {
      id: "#ORD-1022",
      name: "Kirana Lestari",
      date: "12 Jan 2026",
      total: "Rp2.160.000",
      payment: "COD",
      status: "Selesai",
    },
    {
      id: "#ORD-1021",
      name: "Rafi Anugerah",
      date: "11 Jan 2026",
      total: "Rp540.000",
      payment: "COD",
      status: "Dibatalkan",
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-600";
      case "Diproses":
        return "bg-blue-100 text-blue-600";
      case "Selesai":
        return "bg-green-100 text-green-600";
      case "Dibatalkan":
        return "bg-red-100 text-red-500";
      default:
        return "";
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
      <table className="min-w-[760px] w-full text-sm">

        {/* Head */}
        <thead>
          <tr className="text-gray-400 border-b text-left">
            <th className="pb-3">ID Order</th>
            <th>Nama Customer</th>
            <th>Tanggal</th>
            <th>Total Harga</th>
            <th>Metode Pembayaran</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-b last:border-none">

              <td className="py-4 text-blue-600 font-medium">
                {item.id}
              </td>

              <td>{item.name}</td>
              <td>{item.date}</td>
              <td className="font-medium">{item.total}</td>
              <td>{item.payment}</td>

              {/* Status */}
              <td>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(item.status)}`}
                >
                  {item.status}
                </span>
              </td>

              {/* Action */}
              <td className="space-x-2">
                <button className="bg-blue-100 text-blue-500 px-3 py-1 rounded-md text-xs">
                  👁 Detail
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
