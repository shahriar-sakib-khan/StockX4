import { Clock, Book, Users, BarChart3, Search } from 'lucide-react';

export const LandingMoreFeatures = () => {
    const features = [
        {
            icon: Clock,
            title: "Daily Sales (POS)",
            description: "Track all daily sales with comprehensive reporting and multi-payment support.",
            color: "bg-blue-600 text-white"
        },
        {
            icon: Book,
            title: "Business Diary",
            description: "Monitor all expenses and income with detailed categorization and analysis.",
            color: "bg-slate-100 text-slate-600"
        },
        {
            icon: Users,
            title: "Customer Management",
            description: "Complete customer database with payment tracking and order history.",
            color: "bg-slate-100 text-slate-600"
        },
        {
            icon: BarChart3,
            title: "Analytics & Reports",
            description: "Comprehensive profit/loss reports with actionable business insights.",
            color: "bg-slate-100 text-slate-600"
        },
        {
            icon: Search,
            title: "Smart Search",
            description: "Quickly find customers, products, and transactions across the platform.",
            color: "bg-slate-100 text-slate-600"
        }
    ];

    return (
        <section className="py-24 bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-slate-100 text-slate-600 font-medium text-xs mb-4 border border-slate-200">Complete Solution</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">More Powerful Features</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">Everything you need to run your LPG business efficiently</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                         <div key={i} className={`p-8 rounded-3xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group ${i === 0 ? 'border-primary/20 ring-4 ring-primary/5' : ''}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color === 'bg-blue-600 text-white' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors'}`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-slate-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
