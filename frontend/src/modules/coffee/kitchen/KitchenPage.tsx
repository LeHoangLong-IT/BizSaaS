'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Card, Button, notification } from 'antd';
import { CheckCircleOutlined, BellOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/tenant/coffee/orders', { headers: { 'x-tenant-id': 'coffee' } });
        const activeOrders = res.data.filter((o: any) => o.status === 'PENDING' || o.status === 'PREPARING');
        setOrders(activeOrders);
      } catch (err) {
        console.error('Lỗi khi tải đơn hàng:', err);
      }
    };
    fetchOrders();

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
        title: 'Có đơn hàng mới!',
        description: `Bàn số ${orderData.table?.id || '?' } vừa gọi đồ.`,
        icon: <BellOutlined style={{ color: '#faad14' }} />,
      });
    });

    socket.on('orderStatusChanged', ({ orderId, status }) => {
      fetchOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const completeOrder = async (orderId: number) => {
    try {
      await axios.put(`http://localhost:3001/api/tenant/coffee/orders/${orderId}/status`, { status: 'COMPLETED' }, { headers: { 'x-tenant-id': 'coffee' } });
      setOrders(orders.filter(o => o.id !== orderId));
      notification.info({ title: `Đã hoàn thành Đơn #${orderId}` });
    } catch (err) {
      notification.error({ title: 'Lỗi', description: 'Không thể cập nhật trạng thái đơn hàng' });
    }
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
            <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-slate-800/80 border-b border-slate-700 px-5 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-amber-400 m-0">Đơn #{order.id}</h3>
                <span className="text-sm font-semibold text-slate-300 bg-slate-700 px-3 py-1 rounded-full">
                  Bàn {order.table?.name || order.table?.id || 'Mang đi'}
                </span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="space-y-3 mb-6 flex-1">
                  {order.items?.map((item: any, idx: number) => {
                    const [specs, customNote] = item.note ? item.note.split('|') : ['', ''];
                    return (
                      <div key={idx} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <span className="font-bold text-lg text-white">{item.quantity}x {item.product?.name || 'Sản phẩm'}</span>
                        <div className="text-sm text-slate-300 mt-2 space-y-1.5">
                          {specs && (
                            <div className="flex items-start gap-2">
                              <span className="text-slate-400 font-semibold w-[70px] shrink-0">Tùy chọn:</span>
                              <span>{specs.replace('Size: ', '').trim()}</span>
                            </div>
                          )}
                          {item.toppings?.length > 0 && (
                            <div className="flex items-start gap-2">
                              <span className="text-slate-400 font-semibold w-[70px] shrink-0">Topping:</span>
                              <span className="text-amber-300">{item.toppings.map((t: any) => t.name).join(', ')}</span>
                            </div>
                          )}
                          {customNote && (
                            <div className="flex items-start gap-2">
                              <span className="text-slate-400 font-semibold w-[70px] shrink-0">Ghi chú:</span>
                              <span className="text-rose-300 italic font-medium">"{customNote.trim()}"</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg" 
                  onClick={() => completeOrder(order.id)}
                >
                  <CheckCircleOutlined className="text-xl" />
                  <span className="text-lg">Đã Pha Xong</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Icon helper since antd icons inside KDS wasn't fully imported at the top
import { CoffeeOutlined } from '@ant-design/icons';
