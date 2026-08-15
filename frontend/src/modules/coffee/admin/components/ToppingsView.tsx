import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, message, Tabs, Select } from 'antd';
import { EditOutlined, DeleteOutlined, AppstoreOutlined, AppstoreAddOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function ToppingsView({ tenantId, toppings, toppingGroups = [], onRefresh }: { tenantId: string; toppings: any[]; toppingGroups?: any[]; onRefresh: () => void }) {
  // Tabs State
  const [activeTab, setActiveTab] = useState('1');

  // Topping Lẻ States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Topping Group States
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [groupForm] = Form.useForm();
  const [groupSearchText, setGroupSearchText] = useState('');

  // --- TOPPING LẺ HANDLERS ---
  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ items: [{ name: '', price: 0 }] });
    setIsModalVisible(true);
  };
  const handleEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/tenant/${tenantId}/toppings/${id}`, { headers: { 'x-tenant-id': tenantId } });
      message.success('Xóa Topping thành công');
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi xóa Topping');
    }
  };
  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      if (editingItem) {
        await axios.put(`http://localhost:3001/api/tenant/${tenantId}/toppings/${editingItem.id}`, values, { headers: { 'x-tenant-id': tenantId } });
        message.success('Cập nhật Topping thành công');
      } else {
        await axios.post(`http://localhost:3001/api/tenant/${tenantId}/toppings/bulk`, { items: values.items }, { headers: { 'x-tenant-id': tenantId } });
        message.success(`Thêm ${values.items.length} Topping thành công`);
      }
      setIsModalVisible(false);
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi lưu Topping');
    } finally {
      setLoading(false);
    }
  };

  // --- TOPPING GROUP HANDLERS ---
  const handleAddGroup = () => {
    setEditingGroup(null);
    groupForm.resetFields();
    setIsGroupModalVisible(true);
  };
  const handleEditGroup = (record: any) => {
    setEditingGroup(record);
    groupForm.setFieldsValue({
      name: record.name,
      toppingIds: record.toppings?.map((t: any) => t.id) || []
    });
    setIsGroupModalVisible(true);
  };
  const handleDeleteGroup = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/tenant/${tenantId}/topping-groups/${id}`, { headers: { 'x-tenant-id': tenantId } });
      message.success('Xóa Nhóm Topping thành công');
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi xóa Nhóm Topping');
    }
  };
  const handleFinishGroup = async (values: any) => {
    setLoading(true);
    try {
      if (editingGroup) {
        await axios.put(`http://localhost:3001/api/tenant/${tenantId}/topping-groups/${editingGroup.id}`, values, { headers: { 'x-tenant-id': tenantId } });
        message.success('Cập nhật Nhóm Topping thành công');
      } else {
        await axios.post(`http://localhost:3001/api/tenant/${tenantId}/topping-groups`, values, { headers: { 'x-tenant-id': tenantId } });
        message.success('Thêm Nhóm Topping thành công');
      }
      setIsGroupModalVisible(false);
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi lưu Nhóm Topping');
    } finally {
      setLoading(false);
    }
  };

  // --- COLUMNS ---
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên Topping', dataIndex: 'name', key: 'name' },
    { title: 'Giá (VNĐ)', dataIndex: 'price', key: 'price', render: (val: number) => `${Number(val).toLocaleString('vi-VN')} đ` },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xóa Topping này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const groupColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên Nhóm', dataIndex: 'name', key: 'name' },
    {
      title: 'Các Topping bên trong',
      key: 'toppings',
      render: (_: any, record: any) => record.toppings?.map((t: any) => t.name).join(', ') || 'Chưa có topping'
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditGroup(record)} />
          <Popconfirm title="Xóa Nhóm Topping này?" onConfirm={() => handleDeleteGroup(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredToppings = toppings.filter(t => t.name.toLowerCase().includes(searchText.toLowerCase()));
  const filteredGroups = toppingGroups.filter(g => g.name.toLowerCase().includes(groupSearchText.toLowerCase()));

  const tabItems = [
    {
      key: '1',
      label: <span className="font-semibold px-2 flex items-center gap-2"><AppstoreOutlined />Topping Lẻ</span>,
      children: (
        <div>
          <div className="p-5 flex justify-between items-center border-b border-gray-50 pb-5 mb-0">
            <h3 className="text-base font-bold text-gray-800 m-0">Quản lý Topping Lẻ</h3>
            <Space>
              <Input.Search placeholder="Tìm Topping..." allowClear onChange={e => setSearchText(e.target.value)} style={{ width: 220 }} />
              <Button type="primary" onClick={handleAdd} className="bg-[#6b5eae] border-none text-xs font-semibold shadow-sm">+ Thêm Topping</Button>
            </Space>
          </div>
          <Table dataSource={filteredToppings} columns={columns} rowKey="id" pagination={{ pageSize: 10, size: 'small', className: 'mr-4 mb-4' }} className="custom-admin-table mt-0" />
        </div>
      )
    },
    {
      key: '2',
      label: <span className="font-semibold px-2 flex items-center gap-2"><AppstoreAddOutlined />Nhóm Topping</span>,
      children: (
        <div>
          <div className="p-5 flex justify-between items-center border-b border-gray-50 pb-5 mb-0">
            <h3 className="text-base font-bold text-gray-800 m-0">Quản lý Nhóm Topping</h3>
            <Space>
              <Input.Search placeholder="Tìm Nhóm..." allowClear onChange={e => setGroupSearchText(e.target.value)} style={{ width: 220 }} />
              <Button type="primary" onClick={handleAddGroup} className="bg-[#564996] border-none text-xs font-semibold shadow-sm">+ Tạo Nhóm</Button>
            </Space>
          </div>
          <Table dataSource={filteredGroups} columns={groupColumns} rowKey="id" pagination={{ pageSize: 10, size: 'small', className: 'mr-4 mb-4' }} className="custom-admin-table mt-0" />
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-50 overflow-hidden">
      <Tabs defaultActiveKey="1" items={tabItems} className="custom-admin-tabs px-2 pt-2" onChange={setActiveTab} />

      {/* Modal Topping Lẻ */}
      <Modal
        title={editingItem ? "Sửa Topping" : "Thêm Topping"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        forceRender
        width={editingItem ? 480 : 500}
        styles={{ header: { borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 16 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {editingItem ? (
            <div className="flex gap-2 items-start mb-3">
              <Form.Item name="name" label="Tên Topping" rules={[{ required: true }]} className="mb-0" style={{ flex: 7, marginBottom: 0 }}>
                <Input placeholder="Tên topping..." />
              </Form.Item>
              <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true }]} className="mb-0" style={{ flex: 3, marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} placeholder="Giá..." formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={(value) => value?.replace(/\$\s?|(\.*)/g, '') as unknown as number} />
              </Form.Item>
            </div>
          ) : (
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex gap-2 items-start mb-3">
                      <Form.Item {...restField} name={[name, 'name']} label={name === 0 ? "Tên Topping" : ""} rules={[{ required: true, message: 'Nhập tên' }]} className="mb-0" style={{ flex: 7, marginBottom: 0 }}>
                        <Input placeholder="Tên topping..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'price']} label={name === 0 ? "Giá bán (VNĐ)" : ""} rules={[{ required: true, message: 'Nhập giá' }]} className="mb-0" style={{ flex: 3, marginBottom: 0 }}>
                        <InputNumber style={{ width: '100%' }} placeholder="Giá..." formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={(value) => value?.replace(/\$\s?|(\.*)/g, '') as unknown as number} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
                      </Form.Item>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        style={{ marginTop: name === 0 ? 30 : 0 }}
                        onClick={() => {
                          if (fields.length > 1) {
                            remove(name);
                          } else {
                            form.setFieldsValue({ items: [{ name: undefined, price: undefined }] });
                          }
                        }}
                      />
                    </div>
                  ))}
                  <Form.Item className="mt-4 mb-0">
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm Topping</Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          )}
          <Form.Item className="mb-0 flex justify-end mt-6 pt-4 border-t border-gray-100" style={{ marginBottom: 0 }}>
            <Space className="mt-2"><Button onClick={() => setIsModalVisible(false)}>Hủy</Button><Button type="primary" htmlType="submit" loading={loading}>Lưu</Button></Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Topping Group */}
      <Modal title={editingGroup ? "Sửa Nhóm Topping" : "Tạo Nhóm Topping"} open={isGroupModalVisible} onCancel={() => setIsGroupModalVisible(false)} footer={null} forceRender>
        <Form form={groupForm} layout="vertical" onFinish={handleFinishGroup}>
          <Form.Item name="name" label="Tên Nhóm" rules={[{ required: true }]}><Input placeholder="VD: Nhóm Trân Châu" /></Form.Item>
          <Form.Item name="toppingIds" label="Chọn Toppings (có sẵn)">
            <Select mode="multiple" placeholder="Chọn các topping cho nhóm này" className="w-full">
              {toppings.map(t => <Select.Option key={t.id} value={t.id}>{t.name} (+{Number(t.price).toLocaleString('vi-VN')}đ)</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item className="mb-0 flex justify-end">
            <Space><Button onClick={() => setIsGroupModalVisible(false)}>Hủy</Button><Button type="primary" htmlType="submit" loading={loading}>Lưu</Button></Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
