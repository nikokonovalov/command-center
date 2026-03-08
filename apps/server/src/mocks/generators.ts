import type {
    StatsCardData,
    RevenueChartData,
    LiveUsersData,
    ActivityFeedData,
    DataTableData,
    PerformanceChartData,
} from '@command-center/types';

// ─── Revenue Chart ───────────────────────────────────────────────────────────

export function generateRevenueData(): RevenueChartData {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenue = months.map(() => Math.floor(Math.random() * 50000) + 20000);
    const expenses = months.map(() => Math.floor(Math.random() * 30000) + 10000);

    return {
        labels: months,
        datasets: [
            { label: 'Revenue', data: revenue, color: '#6366f1' },
            { label: 'Expenses', data: expenses, color: '#f43f5e' },
        ],
        total: revenue.reduce((a, b) => a + b, 0),
        currency: 'USD',
    };
}

// ─── Stats Cards ─────────────────────────────────────────────────────────────

export function generateStatsData(): StatsCardData[] {
    return [
        {
            label: 'Total Revenue',
            value: `$${(Math.random() * 100000 + 50000).toFixed(0)}`,
            change: +(Math.random() * 20 - 5).toFixed(1),
            changeLabel: 'vs last month',
            icon: 'dollar',
        },
        {
            label: 'Active Users',
            value: Math.floor(Math.random() * 5000) + 2000,
            change: +(Math.random() * 15 - 3).toFixed(1),
            changeLabel: 'vs last week',
            icon: 'users',
        },
        {
            label: 'Conversion Rate',
            value: `${(Math.random() * 5 + 2).toFixed(1)}%`,
            change: +(Math.random() * 3 - 1).toFixed(1),
            changeLabel: 'vs last month',
            icon: 'trending-up',
        },
        {
            label: 'Avg. Order Value',
            value: `$${(Math.random() * 100 + 50).toFixed(2)}`,
            change: +(Math.random() * 10 - 4).toFixed(1),
            changeLabel: 'vs last quarter',
            icon: 'shopping-cart',
        },
    ];
}

// ─── Live Users ──────────────────────────────────────────────────────────────

export function generateLiveUsersData(): LiveUsersData {
    return {
        count: Math.floor(Math.random() * 500) + 100,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as LiveUsersData['trend'],
        locations: [
            { country: 'United States', count: Math.floor(Math.random() * 200) + 50 },
            { country: 'United Kingdom', count: Math.floor(Math.random() * 100) + 20 },
            { country: 'Germany', count: Math.floor(Math.random() * 80) + 15 },
            { country: 'Japan', count: Math.floor(Math.random() * 60) + 10 },
            { country: 'Brazil', count: Math.floor(Math.random() * 40) + 5 },
        ],
    };
}

// ─── Activity Feed ───────────────────────────────────────────────────────────

const users = ['Alice Chen', 'Bob Martinez', 'Carol Johnson', 'Dave Kim', 'Eve Patel'];
const actions = ['purchased', 'signed up', 'commented on', 'shared', 'updated'];
const targets = ['Premium Plan', 'Dashboard Widget', 'Analytics Report', 'Team Settings', 'User Profile'];

export function generateActivityFeedData(): ActivityFeedData {
    return Array.from({ length: 8 }, (_, i) => ({
        id: `activity-${Date.now()}-${i}`,
        user: users[Math.floor(Math.random() * users.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        target: targets[Math.floor(Math.random() * targets.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    }));
}

// ─── Data Table ──────────────────────────────────────────────────────────────

export function generateDataTableData(): DataTableData {
    const rows = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Product ${String.fromCharCode(65 + i)}`,
        category: ['Electronics', 'Clothing', 'Food', 'Books', 'Sports'][i % 5],
        price: +(Math.random() * 200 + 10).toFixed(2),
        stock: Math.floor(Math.random() * 500),
        status: Math.random() > 0.3 ? 'In Stock' : 'Low Stock',
    }));

    return {
        columns: [
            { key: 'id', label: 'ID', sortable: true },
            { key: 'name', label: 'Product Name', sortable: true },
            { key: 'category', label: 'Category', sortable: true },
            { key: 'price', label: 'Price', sortable: true },
            { key: 'stock', label: 'Stock', sortable: true },
            { key: 'status', label: 'Status', sortable: false },
        ],
        rows,
        totalRows: rows.length,
    };
}

// ─── Performance Chart ───────────────────────────────────────────────────────

export function generatePerformanceData(): PerformanceChartData {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    return {
        labels: hours,
        datasets: [
            {
                label: 'CPU Usage',
                data: hours.map(() => +(Math.random() * 80 + 10).toFixed(1)),
                color: '#6366f1',
            },
            {
                label: 'Memory Usage',
                data: hours.map(() => +(Math.random() * 60 + 20).toFixed(1)),
                color: '#10b981',
            },
        ],
    };
}
