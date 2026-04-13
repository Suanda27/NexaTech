export default function Header() {
    return (
        <header className="bg-white border-b px-8 py-6 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-gray-500">Admin Panel</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="font-semibold">Raka Pranata</p>
                    <p className="text-sm text-gray-500">Administrator</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    RP
                </div>
            </div>
        </header>
    );
}
