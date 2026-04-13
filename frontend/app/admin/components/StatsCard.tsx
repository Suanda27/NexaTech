export default function StatsCard({ title, value, growth }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            <p className="text-sm text-green-600 mt-1">{growth}</p>
        </div>
    );
}
