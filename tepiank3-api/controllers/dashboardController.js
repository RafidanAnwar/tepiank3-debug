const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'ADMIN';

        if (isAdmin) {
            // Admin dashboard - all statistics
            const [
                totalUsers,
                totalOrders,
                totalClusters,
                totalParameters,
                totalRevenue,
                recentOrders,
                ordersByStatus,
                monthlyOrders
            ] = await Promise.all([
                prisma.user.count(),
                prisma.order.count(),
                prisma.cluster.count(),
                prisma.parameter.count(),
                prisma.order.aggregate({
                    _sum: { totalAmount: true },
                    where: { status: { in: ['COMPLETED', 'CONFIRMED'] } }
                }),
                prisma.order.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { firstname: true, fullname: true, email: true }
                        },
                        orderItems: {
                            include: {
                                parameter: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }),
                prisma.order.groupBy({
                    by: ['status'],
                    _count: { status: true }
                }),
                prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            COUNT(*)::int as count,
            SUM("totalAmount")::float as revenue
          FROM orders 
          WHERE "createdAt" >= NOW() - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month DESC
        `
            ]);

            res.json({
                overview: {
                    totalUsers,
                    totalOrders,
                    totalClusters,
                    totalParameters,
                    totalRevenue: totalRevenue._sum.totalAmount || 0
                },
                recentOrders,
                ordersByStatus,
                monthlyTrends: monthlyOrders
            });
        } else {
            // User dashboard - personal statistics
            const [
                userOrders,
                userOrdersByStatus,
                userTotalSpent
            ] = await Promise.all([
                prisma.order.findMany({
                    where: { userId: req.user.id },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        orderItems: {
                            include: {
                                parameter: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }),
                prisma.order.groupBy({
                    by: ['status'],
                    where: { userId: req.user.id },
                    _count: { status: true }
                }),
                prisma.order.aggregate({
                    where: {
                        userId: req.user.id,
                        status: { in: ['COMPLETED', 'CONFIRMED'] }
                    },
                    _sum: { totalAmount: true }
                })
            ]);

            res.json({
                overview: {
                    totalOrders: userOrders.length,
                    totalSpent: userTotalSpent._sum.totalAmount || 0
                },
                recentOrders: userOrders,
                ordersByStatus: userOrdersByStatus
            });
        }
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

exports.getNavbarStats = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'ADMIN';

        if (isAdmin) {
            const [
                pendingOrders,
                newUsers,
                systemAlerts
            ] = await Promise.all([
                prisma.order.count({
                    where: { status: 'PENDING' }
                }),
                prisma.user.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                        }
                    }
                }),
                // System alerts (could be expanded)
                Promise.resolve(0)
            ]);

            res.json({
                notifications: {
                    pendingOrders,
                    newUsers,
                    systemAlerts,
                    total: pendingOrders + newUsers + systemAlerts
                }
            });
        } else {
            const [
                userPendingOrders,
                userCompletedOrders
            ] = await Promise.all([
                prisma.order.count({
                    where: {
                        userId: req.user.id,
                        status: 'PENDING'
                    }
                }),
                prisma.order.count({
                    where: {
                        userId: req.user.id,
                        status: 'COMPLETED',
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                        }
                    }
                })
            ]);

            res.json({
                notifications: {
                    pendingOrders: userPendingOrders,
                    completedOrders: userCompletedOrders,
                    total: userPendingOrders + userCompletedOrders
                }
            });
        }
    } catch (error) {
        console.error('Navbar stats error:', error);
        res.status(500).json({ error: 'Failed to fetch navbar statistics' });
    }
};

exports.getPopularParameters = async (req, res) => {
    try {
        const popularParameters = await prisma.orderItem.groupBy({
            by: ['parameterId'],
            _count: { parameterId: true },
            _sum: { quantity: true },
            orderBy: {
                _count: { parameterId: 'desc' }
            },
            take: 10
        });

        // Get parameter details
        const parameterIds = popularParameters.map(p => p.parameterId);
        const parameters = await prisma.parameter.findMany({
            where: { id: { in: parameterIds } },
            include: {
                jenisPengujian: {
                    include: { cluster: true }
                }
            }
        });

        const result = popularParameters.map(pop => {
            const parameter = parameters.find(p => p.id === pop.parameterId);
            return {
                parameter,
                orderCount: pop._count.parameterId,
                totalQuantity: pop._sum.quantity
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Popular parameters error:', error);
        res.status(500).json({ error: 'Failed to fetch popular parameters' });
    }
};
