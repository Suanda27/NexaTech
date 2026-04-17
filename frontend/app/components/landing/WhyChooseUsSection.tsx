import { Zap, Shield, Award, Truck } from "lucide-react";
import { LucideIcon } from "lucide-react";

type Feature = {
    icon: LucideIcon;
    title: string;
    description: string;
};

const features: Feature[] = [
    {
        icon: Truck,
        title: "Fast Delivery",
        description:
            "Lightning-fast shipping to get your tech products delivered when you need them most.",
    },
    {
        icon: Award,
        title: "Premium Quality Products",
        description:
            "Curated selection of top-tier technology from leading brands worldwide.",
    },
    {
        icon: Shield,
        title: "Secure Payment",
        description:
            "Industry-leading encryption and security for all your transactions.",
    },
    {
        icon: Zap,
        title: "Trusted Technology Store",
        description:
            "Join thousands of satisfied customers who trust us for their tech needs.",
    },
];

export default function WhyChooseUsSection() {
    return (
        <section className="bg-white py-14 sm:py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Heading */}
                <div className="mx-auto max-w-2xl text-center mb-14 lg:mb-20">
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        Why Choose NexaTech
                    </h2>

                    <p className="mt-4 text-lg text-gray-600">
                        Experience excellence in every aspect of your technology
                        journey
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className="group relative rounded-lg border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5 sm:p-8"
                            >
                                {/* Icon */}
                                <div className="mb-6">
                                    <div className="inline-flex rounded-xl bg-blue-600/10 p-3 transition-colors duration-300 group-hover:bg-blue-600">
                                        <Icon className="h-6 w-6 text-blue-600 transition-colors duration-300 group-hover:text-white" />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
