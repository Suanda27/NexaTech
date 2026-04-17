export default function Header() {
    return (
        <header className="bg-white border-b px-4 py-5 flex flex-col gap-4 sm:px-6 lg:px-8 lg:py-6 sm:flex-row sm:justify-between sm:items-center">
            <div>
                <h2 className="text-xl font-bold sm:text-2xl">Dashboard</h2>
                <p className="text-gray-500">Admin Panel</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-left sm:text-right">
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
