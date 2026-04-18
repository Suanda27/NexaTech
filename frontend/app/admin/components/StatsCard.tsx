export default function StatsCard({ title, value, growth }: any) {
    return (
        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <p className="text-sm font-medium text-blue-600">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-4">{value}</h3>
            <p className="text-sm font-semibold text-green-600 mt-3">
                {growth}
            </p>
        </div>
    );
}
