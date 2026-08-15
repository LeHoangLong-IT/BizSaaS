import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Upload, Popconfirm, message, Badge } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function ProductsView({ tenantId, products, categories, toppings = [], toppingGroups = [], onRefresh }: { tenantId: string; products: any[]; categories: any[]; toppings?: any[]; toppingGroups?: any[]; onRefresh: () => void }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | null>(null);

  const handleAdd = () => {
    setEditingProduct(null);
    setImageUrl('');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingProduct(record);
    setImageUrl(record.image_url || '');
    form.setFieldsValue({
      name: record.name,
      price: record.price,
      categoryId: record.category?.id,
      toppingIds: record.toppings?.map((t: any) => t.id) || [],
      toppingGroupIds: record.toppingGroups?.map((g: any) => g.id) || []
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/tenant/${tenantId}/products/${id}`, {
        headers: { 'x-tenant-id': tenantId }
      });
      message.success('Đã xóa sản phẩm thành công');
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi xóa sản phẩm');
    }
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = { ...values, image_url: imageUrl };

      if (editingProduct) {
        await axios.put(`http://localhost:3001/api/tenant/${tenantId}/products/${editingProduct.id}`, payload, {
          headers: { 'x-tenant-id': tenantId }
        });
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await axios.post(`http://localhost:3001/api/tenant/${tenantId}/products`, payload, {
          headers: { 'x-tenant-id': tenantId }
        });
        message.success('Thêm sản phẩm thành công');
      }
      setIsModalVisible(false);
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const productColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3 py-2">
          <img src={record.image_url} alt={text} className="w-10 h-10 object-cover rounded bg-gray-50 p-1" />
          <div>
            <div className="font-semibold text-gray-700">{text}</div>
            <div className="text-xs text-gray-400">{record.category?.name || 'Đồ uống'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      key: 'category',
      render: (text: string, record: any) => (
        <div className="text-gray-700 font-medium">{record.category?.name || 'Khác'}</div>
      )
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <div className="text-gray-700 font-medium">{Number(price).toLocaleString('vi-VN')} đ</div>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => <Badge status="success" text="Đang bán" />
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredProducts = products.filter(p => {
    const matchName = p.name.toLowerCase().includes(searchText.toLowerCase());
    const matchCat = filterCategory ? p.category?.id === filterCategory : true;
    return matchName && matchCat;
  });

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-50">
      <div className="p-5 flex justify-between items-center border-b border-gray-50">
        <h3 className="text-base font-bold text-gray-800 m-0">Quản lý Sản phẩm</h3>
        <Space>
          <Input.Search placeholder="Tìm sản phẩm..." allowClear onChange={e => setSearchText(e.target.value)} style={{ width: 220 }} />
          <Select placeholder="Tất cả danh mục" allowClear style={{ width: 160 }} onChange={setFilterCategory}>
            {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
          </Select>
          <Button type="primary" onClick={handleAdd} className="bg-[#6b5eae] border-none text-xs font-semibold shadow-sm">+ Thêm Sản phẩm</Button>
        </Space>
      </div>
      <Table
        dataSource={filteredProducts}
        columns={productColumns}
        rowKey="id"
        pagination={{ pageSize: 10, size: 'small', className: 'mr-4 mb-4' }}
        className="custom-admin-table"
      />

      <Modal
        title={<div className="text-xl font-bold text-gray-800 pb-3 border-b border-gray-100">{editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</div>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        forceRender
        closeIcon={<span className="text-gray-400 hover:text-gray-600 text-lg">✕</span>}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Cột trái: Ảnh */}
            <div className="md:col-span-2">
              <Form.Item label={<span className="font-semibold text-gray-700">Hình ảnh sản phẩm</span>}>
                <Upload
                  name="file"
                  showUploadList={false}
                  action={`http://localhost:3001/api/tenant/${tenantId}/upload`}
                  headers={{ 'x-tenant-id': tenantId }}
                  className="block w-full"
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      setImageUrl(info.file.response.url);
                      message.success('Tải ảnh lên thành công');
                    } else if (info.file.status === 'error') {
                      message.error('Tải ảnh thất bại');
                    }
                  }}
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed transition-all duration-300 flex items-center justify-center cursor-pointer group bg-gray-50 border-gray-200 hover:border-[#6b5eae] hover:bg-[#f4f3fb]">
                    {imageUrl ? (
                      <div className="relative w-full h-full">
                        <img src={imageUrl} alt="product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded-full">Thay đổi ảnh</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-gray-400 group-hover:text-[#6b5eae]">
                          <UploadOutlined className="text-xl" />
                        </div>
                        <div className="text-sm font-semibold text-gray-700 mb-1">Tải ảnh lên</div>
                        <div className="text-xs text-gray-400">PNG, JPG, tối đa 5MB</div>
                      </div>
                    )}
                  </div>
                </Upload>
              </Form.Item>
            </div>

            {/* Cột phải: Thông tin */}
            <div className="md:col-span-4">
              <Form.Item name="name" label={<span className="font-semibold text-gray-700">Tên sản phẩm</span>} rules={[{ required: true }]} className="mb-5">
                <Input size="large" placeholder="VD: Cà Phê Muối" className="rounded-lg h-11" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-5">
                <Form.Item name="price" label={<span className="font-semibold text-gray-700">Giá bán (VNĐ)</span>} rules={[{ required: true }]} className="mb-0">
                  <InputNumber size="large" className="rounded-lg h-11 w-full" style={{ width: '100%' }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={(value) => value?.replace(/\$\s?|(\.*)/g, '') as unknown as number} />
                </Form.Item>

                <Form.Item name="categoryId" label={<span className="font-semibold text-gray-700">Phân loại</span>} rules={[{ required: true }]} className="mb-0">
                  <Select size="large" placeholder="Chọn danh mục" className="rounded-lg h-11">
                    {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item name="toppingGroupIds" label={<span className="font-semibold text-gray-700">Gắn Nhóm Topping (Tùy chọn)</span>} className="mt-5 mb-0">
                <Select size="large" mode="multiple" placeholder="Chọn các nhóm topping (gồm nhiều topping) áp dụng cho món này" className="rounded-lg min-h-11">
                  {toppingGroups.map(g => <Select.Option key={g.id} value={g.id}>{g.name} ({g.toppings?.length || 0} món)</Select.Option>)}
                </Select>
              </Form.Item>

              <Form.Item name="toppingIds" label={<span className="font-semibold text-gray-700">Gắn Topping lẻ (Tùy chọn)</span>} className="mt-5 mb-0">
                <Select size="large" mode="multiple" placeholder="Chọn thêm các topping lẻ áp dụng cho món này" className="rounded-lg min-h-11">
                  {toppings.map(t => <Select.Option key={t.id} value={t.id}>{t.name} (+{Number(t.price).toLocaleString('vi-VN')} đ)</Select.Option>)}
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button size="large" className="px-6 rounded-lg font-medium border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400" onClick={() => setIsModalVisible(false)}>
              Hủy bỏ
            </Button>
            <Button size="large" type="primary" htmlType="submit" loading={loading} className="px-8 rounded-lg bg-[#6b5eae] hover:bg-[#5a4e93] border-none font-semibold shadow-md">
              Lưu sản phẩm
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
