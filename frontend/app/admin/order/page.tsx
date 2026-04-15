import OrderTable from "./OrderTable";

export default function OrderPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Manajemen Order
        </h1>
        <p className="text-gray-500 text-sm">
          Kelola semua pesanan pelanggan
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Cari nama customer atau ID order"
          className="flex-1 px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select className="px-4 py-2 border rounded-lg text-sm">
          <option>Semua Status</option>
          <option>Pending</option>
          <option>Diproses</option>
          <option>Selesai</option>
          <option>Dibatalkan</option>
        </select>
      </div>

      {/* Table */}
      <OrderTable />
    </div>
  );
}