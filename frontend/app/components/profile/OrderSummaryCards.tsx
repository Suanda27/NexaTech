"use client";

import { Package, Clock, CheckCircle } from "lucide-react";

export default function OrderSummaryCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                    <Package className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">
                        Total Orders
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900">6</h2>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">
                        Processing
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900">2</h2>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="text-green-600 w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">
                        Delivered
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900">2</h2>
                </div>
            </div>
        </div>
    );
}
