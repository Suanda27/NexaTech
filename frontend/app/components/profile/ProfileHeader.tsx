export default function ProfileHeader() {
    return (
        <div className="flex justify-between items-center bg-white p-6 border-b">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full" />
                <div>
                    <p className="font-semibold">John Doe</p>
                    <p className="text-sm text-gray-500">Customer</p>
                </div>
            </div>

            <button className="border px-4 py-2 text-red-500 rounded">
                Sign Out
            </button>
        </div>
    );
}
