import React, { useEffect, useState } from 'react';
import { NavBar } from '../../components/layout/NavBar';
import api from '../../services/api';
import { FileText, Calendar, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TransactionHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-emerald-100 text-emerald-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'IN_PROGRESS': return <Clock className="w-4 h-4 mr-1" />;
            case 'PENDING': return <AlertCircle className="w-4 h-4 mr-1" />;
            case 'CONFIRMED': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'CANCELLED': return <XCircle className="w-4 h-4 mr-1" />;
            default: return <Clock className="w-4 h-4 mr-1" />;
        }
    };

    const getFriendlyStatus = (status) => {
        switch (status) {
            case 'PENDING': return 'Menunggu Persetujuan';
            case 'CONFIRMED': return 'Disetujui';
            case 'IN_PROGRESS': return 'Dalam Pengerjaan';
            case 'COMPLETED': return 'Selesai';
            case 'CANCELLED': return 'Dibatalkan';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                    <FileText className="mr-3 w-8 h-8" />
                    Riwayat Transaksi
                </h1>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Memuat riwayat...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500 text-lg mb-4">Belum ada riwayat transaksi</p>
                        <button
                            onClick={() => navigate('/home')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Buat Pesanan Baru
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer border border-transparent hover:border-blue-200"
                                onClick={() => navigate('/status-pengujian', { state: { orderId: order.id } })}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-lg text-gray-900">{order.orderNumber}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {getFriendlyStatus(order.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-500 text-sm gap-4">
                                            <span className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span>•</span>
                                            <span>{order.company || 'Perorangan'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-blue-600 font-medium">
                                        Lihat Detail <ChevronRight className="w-5 h-5 ml-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
