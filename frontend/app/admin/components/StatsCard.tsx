export default function StatsCard({ title, value, growth }: any) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border sm:p-6">
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            <p className="text-sm text-green-600 mt-1">{growth}</p>
        </div>
    );
}
