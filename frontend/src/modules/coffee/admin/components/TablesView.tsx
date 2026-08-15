import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Popconfirm, message, Badge, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, QrcodeOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function TablesView({ tenantId, tables, onRefresh }: { tenantId: string; tables: any[]; onRefresh: () => void }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  
  // QR Code Modal
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTableQR, setSelectedTableQR] = useState<any>(null);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ status: 'AVAILABLE' });
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/tenant/${tenantId}/tables/${id}`, { headers: { 'x-tenant-id': tenantId } });
      message.success('Xóa bàn thành công');
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi xóa bàn');
    }
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      if (editingItem) {
        await axios.put(`http://localhost:3001/api/tenant/${tenantId}/tables/${editingItem.id}`, values, { headers: { 'x-tenant-id': tenantId } });
        message.success('Cập nhật bàn thành công');
      } else {
        await axios.post(`http://localhost:3001/api/tenant/${tenantId}/tables`, values, { headers: { 'x-tenant-id': tenantId } });
        message.success('Thêm bàn thành công');
      }
      setIsModalVisible(false);
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi lưu thông tin bàn');
    } finally {
      setLoading(false);
    }
  };

  const showQRCode = (record: any) => {
    setSelectedTableQR(record);
    setQrModalVisible(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên bàn / Khu vực', dataIndex: 'name', key: 'name' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        if (status === 'AVAILABLE') return <Badge status="success" text="Trống" />;
        if (status === 'OCCUPIED') return <Badge status="error" text="Đang phục vụ" />;
        return <Badge status="default" text={status} />;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<QrcodeOutlined />} onClick={() => showQRCode(record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xóa bàn này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredTables = tables.filter(t => {
    const matchName = t.name.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchName && matchStatus;
  });

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-50 flex flex-col min-h-[500px]">
      <div className="p-5 flex justify-between items-center border-b border-gray-50">
        <Space>
          <h3 className="text-base font-bold text-gray-800 m-0 mr-4">Quản lý Bàn</h3>
          <Switch 
            checkedChildren={<AppstoreOutlined />} 
            unCheckedChildren={<UnorderedListOutlined />} 
            checked={viewMode === 'map'}
            onChange={(c) => setViewMode(c ? 'map' : 'list')}
          />
        </Space>
        <Space>
          <Input.Search placeholder="Tìm bàn..." allowClear onChange={e => setSearchText(e.target.value)} style={{ width: 180 }} />
          <Select placeholder="Tất cả trạng thái" allowClear style={{ width: 160 }} onChange={setFilterStatus}>
            <Select.Option value="AVAILABLE">Trống</Select.Option>
            <Select.Option value="OCCUPIED">Đang phục vụ</Select.Option>
          </Select>
          <Button type="primary" onClick={handleAdd} className="bg-[#6b5eae] border-none text-xs font-semibold shadow-sm">+ Thêm Bàn</Button>
        </Space>
      </div>
      
      {viewMode === 'list' ? (
        <Table dataSource={filteredTables} columns={columns} rowKey="id" pagination={{ pageSize: 10, size: 'small', className: 'mr-4 mb-4' }} className="custom-admin-table" />
      ) : (
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 bg-gray-50 flex-grow">
          {filteredTables.map(t => (
            <div 
              key={t.id} 
              className={`rounded-xl shadow-sm border-2 p-4 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 ${t.status === 'OCCUPIED' ? 'bg-red-50 border-red-300' : 'bg-white border-green-300'}`}
              onClick={() => showQRCode(t)}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${t.status === 'OCCUPIED' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                {t.status === 'OCCUPIED' ? <UnorderedListOutlined className="text-xl" /> : <AppstoreOutlined className="text-xl" />}
              </div>
              <h4 className="font-bold text-gray-800 text-center mb-1">{t.name}</h4>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${t.status === 'OCCUPIED' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {t.status === 'OCCUPIED' ? 'ĐANG PHỤC VỤ' : 'TRỐNG'}
              </span>
            </div>
          ))}
          {filteredTables.length === 0 && (
            <div className="col-span-full flex justify-center py-10 text-gray-400">Không tìm thấy bàn nào</div>
          )}
        </div>
      )}
      
      <Modal title={editingItem ? "Sửa thông tin Bàn" : "Thêm Bàn mới"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} forceRender>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="Tên bàn" rules={[{ required: true }]}><Input placeholder="VD: Bàn số 1" /></Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
             <Select>
                <Select.Option value="AVAILABLE">Trống</Select.Option>
                <Select.Option value="OCCUPIED">Đang phục vụ</Select.Option>
             </Select>
          </Form.Item>
          <Form.Item className="mb-0 flex justify-end">
            <Space><Button onClick={() => setIsModalVisible(false)}>Hủy</Button><Button type="primary" htmlType="submit" loading={loading}>Lưu</Button></Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal QR Code */}
      <Modal title={`Mã QR - ${selectedTableQR?.name}`} open={qrModalVisible} onCancel={() => setQrModalVisible(false)} footer={null} width={350}>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
            {selectedTableQR && (
              <QRCodeSVG 
                value={`http://localhost:3000/coffee?table=${selectedTableQR.id}`} 
                size={200}
                level="H"
                imageSettings={{
                  src: "/coffee/logo.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            )}
          </div>
          <p className="text-center text-gray-500 mb-4 text-sm">Quét mã QR này để tự động đặt món cho <strong className="text-gray-800">{selectedTableQR?.name}</strong></p>
          <Button type="primary" className="bg-[#6b5eae] border-none" icon={<QrcodeOutlined />}>
            Tải mã QR (In)
          </Button>
        </div>
      </Modal>
    </div>
  );
}
