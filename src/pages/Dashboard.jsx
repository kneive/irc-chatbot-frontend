import { useQuery } from '@tanstack/react-query';
import { getOverview, getMessageStats } from '../api/client';
import { BarChart, LineChart } from 'recharts';
import { use } from 'react';

export default function Dashboard() {
    const { data: overview } = useQuery({
        queryKey: ['overview'],
        queryFn: getOverview
    });

    const { data: messageStats } = useQuery({
        queryKey: ['messageStats'],
        queryFn: getMessageStats
    });

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Salty Analytics</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <StatCard title="Messages" value={overview?.totals.messages} />
                <StatCard title="Users" value={overview?.totals.users} />
                <StatCard title="Rooms" valu={overview?.totals.rooms} />
                <StatCard title="Total Bits" value={overview?.totals.bits} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-x1 mb-4">Messages by hour</h2>
                    <LineChart data={messageStats?.messages_by_hour} />
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl mb-4">Top Rooms</h2>
                    <BarChart data={messageStats?.messages_by_room?.slice(0, 5)} />
                </div>
            </div>
        </div>
    );
}