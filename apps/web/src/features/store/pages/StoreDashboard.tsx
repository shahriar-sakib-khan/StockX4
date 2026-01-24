export const StoreDashboard = () => {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Store Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-card rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
                    <p className="text-2xl font-bold">৳0.00</p>
                </div>
                <div className="p-6 bg-card rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Active Orders</h3>
                    <p className="text-2xl font-bold">0</p>
                </div>
                <div className="p-6 bg-card rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Low Stock Items</h3>
                    <p className="text-2xl font-bold text-yellow-600">0</p>
                </div>
            </div>
            <p className="text-muted-foreground">Analytics coming soon.</p>
        </div>
    );
};
