import React, { useState } from 'react';
import { Table, Button, Space, Select, message, Badge, Tag } from 'antd';
import axios from 'axios';

export default function OrdersView({ tenantId, orders, onRefresh }: { tenantId: string; orders: any[]; onRefresh: () => void }) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setLoadingId(id);
    try {
      await axios.put(`http://localhost:3001/api/tenant/${tenantId}/orders/${id}/status`, { status: newStatus }, { headers: { 'x-tenant-id': tenantId } });
      message.success('Cập nhật trạng thái đơn hàng thành công');
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setLoadingId(null);
    }
  };

  const columns = [
    { title: 'Mã Đơn', dataIndex: 'id', key: 'id', width: 80, render: (id: number) => <strong>#{id}</strong> },
    { title: 'Thời gian', dataIndex: 'created_at', key: 'created_at', render: (val: string) => new Date(val).toLocaleString('vi-VN') },
    { title: 'Bàn', key: 'table', render: (_: any, record: any) => record.table?.name || 'Mang đi' },
    {
      title: 'Món ăn',
      key: 'items',
      render: (_: any, record: any) => (
        <div className="flex flex-col gap-1.5">
          {record.items?.map((item: any) => {
            const [specs, customNote] = item.note ? item.note.split('|') : ['', ''];
            return (
              <div key={item.id} className="text-[13px] border border-gray-100 rounded px-2 py-1 bg-gray-50/50">
                <div className="font-bold text-black">
                  <span className="text-[#8B5742]">{item.quantity}x</span> {item.product?.name}
                </div>
                <div className="mt-0.5 space-y-0.5 text-[11px]">
                  {specs && (
                    <div className="flex gap-1 text-gray-600">
                      <span className="font-medium">Tùy chọn:</span>
                      <span>{specs.replace('Size: ', '').trim()}</span>
                    </div>
                  )}
                  {item.toppings?.length > 0 && (
                    <div className="flex gap-1 text-gray-600">
                      <span className="font-medium">Topping:</span>
                      <span className="text-orange-600 font-medium">{item.toppings.map((t: any) => t.name).join(', ')}</span>
                    </div>
                  )}
                  {customNote && (
                    <div className="flex gap-1">
                      <span className="font-medium text-gray-600">Ghi chú:</span>
                      <span className="text-red-500 italic">"{customNote.trim()}"</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )
    },
    {
      title: 'Tổng tiền',
      key: 'total',
      render: (_: any, record: any) => {
        let total = 0;
        record.items?.forEach((item: any) => {
          total += (Number(item.product?.price) || 0) * item.quantity;
          item.toppings?.forEach((t: any) => total += (Number(t.price) || 0) * item.quantity);
        });
        return <strong className="text-[#8B5742]">{total.toLocaleString('vi-VN')} đ</strong>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'UNPAID') return <Tag color="error" className="animate-pulse">Chờ thanh toán</Tag>;
        if (status === 'PENDING') return <Tag color="warning">Đang chờ</Tag>;
        if (status === 'PREPARING') return <Tag color="processing">Đang pha chế</Tag>;
        if (status === 'SERVED') return <Tag color="success">Đã phục vụ</Tag>;
        if (status === 'PAID') return <Tag color="success">Đã thanh toán</Tag>;
        if (status === 'CANCELLED') return <Tag color="error">Đã hủy</Tag>;
        return <Tag>{status}</Tag>;
      }
    },
    {
      title: 'Cập nhật',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Select
          value={record.status}
          onChange={(val) => handleStatusChange(record.id, val)}
          disabled={loadingId === record.id}
          className="w-full"
          style={{ fontSize: '12px' }}
          size="small"
        >
          <Select.Option style={{ fontSize: '12px' }} value="UNPAID">Chờ thanh toán</Select.Option>
          <Select.Option style={{ fontSize: '12px' }} value="PENDING">Chờ xử lý</Select.Option>
          <Select.Option style={{ fontSize: '12px' }} value="PREPARING">Pha chế</Select.Option>
          <Select.Option style={{ fontSize: '12px' }} value="SERVED">Phục vụ</Select.Option>
          <Select.Option style={{ fontSize: '12px' }} value="PAID">Thanh toán</Select.Option>
          <Select.Option style={{ fontSize: '12px' }} value="CANCELLED">Hủy đơn</Select.Option>
        </Select>
      )
    }
  ];

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-50">
      <div className="p-5 flex justify-between items-center border-b border-gray-50">
        <h3 className="text-base font-bold text-gray-800 m-0">Quản lý Đơn hàng</h3>
      </div>
      <Table 
        size="small" 
        dataSource={orders} 
        columns={columns} 
        rowKey="id" 
        pagination={{ pageSize: 10 }} 
        className="custom-admin-table text-[13px] px-3 pb-3 [&_.ant-table-thead_th]:!bg-gray-200 [&_.ant-table-thead_th]:!text-gray-800 [&_.ant-table-thead_th]:!font-bold" 
        rowClassName={(record, index) => index % 2 !== 0 ? 'bg-gray-100 hover:bg-gray-200 transition-colors' : 'bg-white hover:bg-gray-50 transition-colors'}
      />
    </div>
  );
}
