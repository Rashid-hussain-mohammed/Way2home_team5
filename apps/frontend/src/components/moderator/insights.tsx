import React, { useEffect, useState, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController } from 'chart.js';
import { fetchMostVisited, fetchMostFavorited, fetchMostApplied, fetchPropertyCounts, fetchUserCounts } from '../../api';
import type { IProperty } from '@gdsd/common/models';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    BarController
);

interface IFavoritedProperty extends IProperty {
    favoriteCount: number;
}

interface IAppliedProperty extends IProperty {
    applicationCount: number;
}

interface ChartData {
    labels: string[];
    datasets: [
        {
            label: string;
            data: number[];
            backgroundColor: string[];
            borderColor: string[];
            borderWidth: number;
        }
    ];
}

const Insights: React.FC = () => {
    const [mostVisited, setMostVisited] = useState<IProperty[]>([]);
    const [mostFavorited, setMostFavorited] = useState<IFavoritedProperty[]>([]);
    const [mostApplied, setMostApplied] = useState<IAppliedProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mostVisitedRef = useRef<HTMLCanvasElement>(null);
    const mostFavoritedRef = useRef<HTMLCanvasElement>(null);
    const mostAppliedRef = useRef<HTMLCanvasElement>(null);
    const mostVisitedInstance = useRef<ChartJS | null>(null);
    const mostFavoritedInstance = useRef<ChartJS | null>(null);
    const mostAppliedInstance = useRef<ChartJS | null>(null);

    const [propertyCounts, setPropertyCounts] = useState<{ Approved: number; Pending: number; Rejected: number }>({
        Approved: 0,
        Pending: 0,
        Rejected: 0,
    });

    const [userCounts, setUserCounts] = useState<{ Student: number; Landlord: number; Moderator: number }>({
        Student: 0,
        Landlord: 0,
        Moderator: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [visitedRes, favoritedRes, appliedRes, propertyCountsRes, userCountsRes] = await Promise.all([
                    fetchMostVisited(),
                    fetchMostFavorited(),
                    fetchMostApplied(),
                    fetchPropertyCounts(),
                    fetchUserCounts(),
                ]);

                if (visitedRes.success) setMostVisited(visitedRes.data);
                if (favoritedRes.success) setMostFavorited(favoritedRes.data);
                if (appliedRes.success) setMostApplied(appliedRes.data);
                if (propertyCountsRes.success && propertyCountsRes.data) {
                    setPropertyCounts({
                        Approved: propertyCountsRes.data.Approved || 0,
                        Pending: propertyCountsRes.data.Pending || 0,
                        Rejected: propertyCountsRes.data.Rejected || 0,
                    });
                } else if (propertyCountsRes.success) {
                    setPropertyCounts({ Approved: 0, Pending: 0, Rejected: 0 });
                } else if (!propertyCountsRes.success) {
                    setError("Error fetching property counts");
                }

                if (userCountsRes.success && userCountsRes.data) {
                    setUserCounts({
                        Student: userCountsRes.data.Student || 0,
                        Landlord: userCountsRes.data.Landlord || 0,
                        Moderator: userCountsRes.data.Moderator || 0,
                    });
                } else if (userCountsRes.success) {
                    setUserCounts({ Student: 0, Landlord: 0, Moderator: 0 });
                } else if (!userCountsRes.success) {
                    setError("Error fetching user counts");
                }

            } catch (err: any) {
                setError(err.message);
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const createChart = (ctx: CanvasRenderingContext2D | null, data: any, chartInstance: any, title: string) => {
        if (ctx) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            chartInstance.current = new ChartJS(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: title,
                        },
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            enabled: true,
                        },
                    },
                    scales: {
                        x: {
                            type: 'category',
                            title: {
                                display: true,
                                text: 'Property Name',
                            },
                            ticks: {
                                callback: function (value: string | number, index, ticks) {
                                    const label = this.getLabelForValue(Number(value));
                                    return label.length > 15 ? label.slice(0, 15) + '...' : label;
                                },
                                maxRotation: 45,
                                minRotation: 0,
                                autoSkip: false,
                            },
                        },
                        y: {
                            type: 'linear',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Count',
                            },
                            ticks: {
                                stepSize: 1,
                                precision: 0,
                            },
                        },
                    },
                },
            });
        }
    };

    useEffect(() => {
        const destroyCharts = () => {
            if (mostVisitedInstance.current) mostVisitedInstance.current.destroy();
            if (mostFavoritedInstance.current) mostFavoritedInstance.current.destroy();
            if (mostAppliedInstance.current) mostAppliedInstance.current.destroy();
        };

        if (mostVisited.length > 0 && mostVisitedRef.current) {
            const ctx = mostVisitedRef.current.getContext('2d');
            const data = chartData(mostVisited, 'visits');
            createChart(ctx, data, mostVisitedInstance, "Most Visited Properties");
        }

        if (mostFavorited.length > 0 && mostFavoritedRef.current) {
            const ctx = mostFavoritedRef.current.getContext('2d');
            const data = chartData(mostFavorited, 'favoriteCount');
            createChart(ctx, data, mostFavoritedInstance, "Most Favorited Properties");
        }

        if (mostApplied.length > 0 && mostAppliedRef.current) {
            const ctx = mostAppliedRef.current.getContext('2d');
            const data = chartData(mostApplied, 'applicationCount');
            createChart(ctx, data, mostAppliedInstance, "Most Applied Properties");
        }

        return destroyCharts;
    }, [mostVisited, mostFavorited, mostApplied]);

    const chartData = (data: IProperty[] | IFavoritedProperty[] | IAppliedProperty[], countKey: string): ChartData => {
        const labels = data.map(item => item.name || "Unknown Property");
        const dataValues = data.map(item => {
            const value = item[countKey as keyof (IProperty | IFavoritedProperty | IAppliedProperty)];
            return typeof value === 'number' ? value : 0;
        });

        return {
            labels: labels,
            datasets: [
                {
                    label: "Count",
                    data: dataValues,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    return (
        <div className="p-5 flex flex-col w-full">
            {loading && <div className="p-4 text-center">Loading charts...</div>}

            {error && <div className="p-4 text-center text-red-500">Error: {error}</div>}

            {!loading && !error && (
                <>
                    <header className="bg-white shadow rounded-lg p-5 mb-8">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-2xl font-bold text-gray-800">Insights</h1>
                            <p className="text-gray-600">Analyze property and user activity</p>
                        </div>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        <div className="border border-gray-200 p-5 rounded-lg shadow-sm text-center flex flex-col items-center justify-center h-24 bg-gray-50 hover:shadow-md transition-shadow">
                            <span className="text-gray-600 text-sm">Total Approved Listings</span>
                            <span className="text-gray-800 text-xl font-bold">{propertyCounts.Approved}</span>
                        </div>
                        <div className="border border-gray-200 p-5 rounded-lg shadow-sm text-center flex flex-col items-center justify-center h-24 bg-gray-50 hover:shadow-md transition-shadow">
                            <span className="text-gray-600 text-sm">Total Pending Listings</span>
                            <span className="text-gray-800 text-xl font-bold">{propertyCounts.Pending}</span>
                        </div>
                        <div className="border border-gray-200 p-5 rounded-lg shadow-sm text-center flex flex-col items-center justify-center h-24 bg-gray-50 hover:shadow-md transition-shadow">
                            <span className="text-gray-600 text-sm">Registered Students</span>
                            <span className="text-gray-800 text-xl font-bold">{userCounts.Student}</span>
                        </div>
                        <div className="border border-gray-200 p-5 rounded-lg shadow-sm text-center flex flex-col items-center justify-center h-24 bg-gray-50 hover:shadow-md transition-shadow">
                            <span className="text-gray-600 text-sm">Registered Landlords</span>
                            <span className="text-gray-800 text-xl font-bold">{userCounts.Landlord}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-5">
                        <div className="flex-1 min-w-[300px] border border-gray-200 p-3 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="w-full h-72 relative">
                                <canvas ref={mostVisitedRef} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[300px] border border-gray-200 p-3 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="w-full h-72 relative">
                                <canvas ref={mostFavoritedRef} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[300px] border border-gray-200 p-3 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                            <div className="w-full h-72 relative">
                                <canvas ref={mostAppliedRef} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Insights;