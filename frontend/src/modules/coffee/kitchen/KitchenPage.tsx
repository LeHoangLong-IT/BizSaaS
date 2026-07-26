'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Card, Button, notification } from 'antd';
import { CheckCircleOutlined, BellOutlined } from '@ant-design/icons';

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Kết nối tới Socket.io Backend
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('KDS Connected to WebSocket server');
    });

    socket.on('newOrder', (orderData) => {
      // Có đơn mới nhảy về
      setOrders((prev) => [orderData, ...prev]);
      
      // Bắn thông báo âm thanh / popup
      notification.success({
        message: 'Có đơn hàng mới!',
        description: `Bàn số ${orderData.table?.id || '?' } vừa gọi đồ.`,
        icon: <BellOutlined style={{ color: '#faad14' }} />,
        placement: 'topRight',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const completeOrder = (orderId: number) => {
    setOrders(orders.filter(o => o.id !== orderId));
    notification.info({ message: `Đã hoàn thành Đơn #${orderId}` });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-amber-400">☕ KITCHEN DISPLAY SYSTEM</h1>
        <div className="flex items-center gap-2">
          <span className="animate-pulse h-3 w-3 bg-green-500 rounded-full"></span>
          <span className="text-green-400 font-semibold">Online (Realtime)</span>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <CoffeeOutlined className="text-6xl mb-4 opacity-20" />
          <p className="text-xl">Chưa có đơn hàng nào, quầy bar rảnh rỗi...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="bg-gray-800 border-gray-700 text-white shadow-xl" headStyle={{ color: '#fbbf24', borderBottom: '1px solid #374151' }} title={`Đơn #${order.id} - Bàn ${order.table?.id || '?'}`}>
              <div className="space-y-3 mb-6">
                {/* Giả lập hiển thị item do backend tạm thời chưa populate nested relations trong lệnh create */}
                <div className="p-3 bg-gray-700 rounded-lg">
                  <span className="font-bold text-lg">1x Cà phê Sữa</span>
                  <p className="text-sm text-gray-400 mt-1">- Thêm Trân châu</p>
                </div>
              </div>
              <Button type="primary" block size="large" icon={<CheckCircleOutlined />} className="bg-green-600 hover:bg-green-500 border-none" onClick={() => completeOrder(order.id)}>
                Đã Pha Xong
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Icon helper since antd icons inside KDS wasn't fully imported at the top
import { CoffeeOutlined } from '@ant-design/icons';
