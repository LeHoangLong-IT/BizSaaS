import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import axios from 'axios';

import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Custom Row Component for DnD
const Row = (props: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999, background: '#f5f5f5' } : {}),
  };

  return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
};

export default function CategoriesView({ tenantId, categories, onRefresh }: { tenantId: string; categories: any[]; onRefresh: () => void }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const [dataSource, setDataSource] = useState<any[]>([]);

  useEffect(() => {
    // Sync local state when props change
    setDataSource(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Require moving 1px before dragging starts to allow clicking buttons
      },
    })
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = dataSource.findIndex((i) => i.id === active.id);
      const overIndex = dataSource.findIndex((i) => i.id === over?.id);
      
      const newDataSource = arrayMove(dataSource, activeIndex, overIndex);
      setDataSource(newDataSource);

      // Construct payload
      const items = newDataSource.map((cat, index) => ({
        id: cat.id,
        sortOrder: index,
      }));

      try {
        await axios.put(`http://localhost:3001/api/tenant/${tenantId}/categories/reorder`, { items }, { headers: { 'x-tenant-id': tenantId } });
        // Mute success message for drag to not spam, just refresh
        onRefresh();
      } catch (error) {
        message.error('Lỗi khi lưu thứ tự');
        setDataSource(categories); // Revert on error
      }
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/tenant/${tenantId}/categories/${id}`, { headers: { 'x-tenant-id': tenantId } });
      message.success('Xóa danh mục thành công');
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi xóa danh mục');
    }
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      if (editingItem) {
        await axios.put(`http://localhost:3001/api/tenant/${tenantId}/categories/${editingItem.id}`, values, { headers: { 'x-tenant-id': tenantId } });
        message.success('Cập nhật danh mục thành công');
      } else {
        // Mới tạo thì tự xếp xuống cuối
        values.sortOrder = dataSource.length;
        await axios.post(`http://localhost:3001/api/tenant/${tenantId}/categories`, values, { headers: { 'x-tenant-id': tenantId } });
        message.success('Thêm danh mục thành công');
      }
      setIsModalVisible(false);
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'sort', align: 'center' as const, width: 50, render: () => <HolderOutlined style={{ cursor: 'grab', color: '#999' }} /> },
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Icon (Mã)', dataIndex: 'icon', key: 'icon' },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onPointerDown={(e) => e.stopPropagation()} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xóa danh mục này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button type="text" danger icon={<DeleteOutlined />} onPointerDown={(e) => e.stopPropagation()} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredCategories = dataSource.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-50">
      <div className="p-5 flex justify-between items-center border-b border-gray-50">
        <h3 className="text-base font-bold text-gray-800 m-0">Quản lý Danh mục</h3>
        <Space>
          <Input.Search placeholder="Tìm danh mục..." allowClear onChange={e => setSearchText(e.target.value)} style={{ width: 220 }} />
          <Button type="primary" onClick={handleAdd} className="bg-[#6b5eae] border-none text-xs font-semibold shadow-sm">+ Thêm Danh mục</Button>
        </Space>
      </div>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredCategories.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <Table 
            components={{ body: { row: Row } }}
            dataSource={filteredCategories} 
            columns={columns} 
            rowKey="id" 
            pagination={false} 
            className="custom-admin-table" 
          />
        </SortableContext>
      </DndContext>
      
      <Modal title={editingItem ? "Sửa danh mục" : "Thêm danh mục"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} forceRender>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="icon" label="Mã Icon (vd: coffee, tea)"><Input /></Form.Item>
          <Form.Item className="mb-0 flex justify-end">
            <Space><Button onClick={() => setIsModalVisible(false)}>Hủy</Button><Button type="primary" htmlType="submit" loading={loading}>Lưu</Button></Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
