import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Select, Checkbox, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function QRConfigsView({ tenantId, qrConfigs, onRefresh }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [previewData, setPreviewData] = useState<any>({});

  const banks = [
    { value: '970436', label: 'Vietcombank (VCB)' },
    { value: '970422', label: 'MBBank (MB)' },
    { value: '970415', label: 'VietinBank (CTG)' },
    { value: '970418', label: 'BIDV' },
    { value: '970405', label: 'Agribank' },
    { value: '970407', label: 'Techcombank (TCB)' },
    { value: '970416', label: 'ACB' },
    { value: '970432', label: 'VPBank' },
    { value: '970423', label: 'TPBank' },
  ];

  const handleOpenModal = (config: any = null) => {
    setEditingConfig(config);
    if (config) {
      const initial = {
        bank_id: config.bank_id,
        account_no: config.account_no,
        account_name: config.account_name,
        show_amount: config.show_amount,
        show_account_name: config.show_account_name,
        show_account_no: config.show_account_no,
        show_add_info: config.show_add_info,
        show_bank_name: config.show_bank_name,
      };
      form.setFieldsValue(initial);
      setPreviewData(initial);
    } else {
      form.resetFields();
      const initial = {
        show_amount: true,
        show_account_name: true,
        show_account_no: false,
        show_add_info: false,
        show_bank_name: false,
      };
      form.setFieldsValue(initial);
      setPreviewData(initial);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    
    // Merge checkbox values from previewData
    const finalValues = {
      ...values,
      show_amount: previewData.show_amount,
      show_account_name: previewData.show_account_name,
      show_account_no: previewData.show_account_no,
      show_bank_name: previewData.show_bank_name,
      show_add_info: previewData.show_add_info,
    };

    try {
      if (editingConfig) {
        await axios.put(`http://localhost:3001/api/tenant/${tenantId}/vietqr/${editingConfig.id}`, finalValues, {
          headers: { 'x-tenant-id': tenantId }
        });
        message.success('Cập nhật mã QR thành công');
      } else {
        await axios.post(`http://localhost:3001/api/tenant/${tenantId}/vietqr`, finalValues, {
          headers: { 'x-tenant-id': tenantId }
        });
        message.success('Thêm mã QR mới thành công');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi lưu mã QR');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xóa mã QR',
      content: 'Bạn có chắc chắn muốn xóa mã QR này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3001/api/tenant/${tenantId}/vietqr/${id}`, {
            headers: { 'x-tenant-id': tenantId }
          });
          message.success('Đã xóa mã QR');
          onRefresh();
        } catch (err) {
          message.error('Lỗi khi xóa mã QR');
        }
      }
    });
  };

  const handleToggleActive = async (id: number) => {
    try {
      await axios.put(`http://localhost:3001/api/tenant/${tenantId}/vietqr/${id}/active`, {}, {
        headers: { 'x-tenant-id': tenantId }
      });
      message.success('Đã chọn làm mã QR mặc định');
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi chọn mã QR mặc định');
    }
  };

  const columns = [
    {
      title: 'Ngân hàng',
      dataIndex: 'bank_id',
      key: 'bank_id',
      render: (val: string) => banks.find(b => b.value === val)?.label || val
    },
    {
      title: 'Số TK',
      dataIndex: 'account_no',
      key: 'account_no',
      render: (val: string) => <span className="font-bold">{val}</span>
    },
    {
      title: 'Chủ TK',
      dataIndex: 'account_name',
      key: 'account_name',
    },
    {
      title: 'Mặc định (Sử dụng)',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: any) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id)}
          checkedChildren={<CheckCircleOutlined />}
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-gray-800 m-0 flex items-center gap-2">
          <QrcodeOutlined className="text-[#6b5eae]" /> Quản lý QR Thanh toán
        </h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-[#1abc9c]"
          onClick={() => handleOpenModal()}
        >
          Thêm QR mới
        </Button>
      </div>

      <Table
        dataSource={qrConfigs}
        columns={columns}
        rowKey="id"
        pagination={false}
        className="custom-admin-table"
      />

      <Modal
        title={<div className="text-lg font-bold">{editingConfig ? 'Sửa cấu hình QR' : 'Thêm QR mới'}</div>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={850}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onValuesChange={(changedValues, allValues) => setPreviewData(allValues)}
          className="mt-4"
        >
          <div className="flex gap-8">
            {/* Cột trái: Cấu hình */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                <Form.Item
                  name="bank_id"
                  label="Ngân hàng"
                  rules={[{ required: true, message: 'Chọn ngân hàng' }]}
                >
                  <Select
                    showSearch
                    options={banks}
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  />
                </Form.Item>
                <Form.Item
                  name="account_no"
                  label="Số tài khoản"
                  rules={[{ required: true, message: 'Nhập số tài khoản' }]}
                >
                  <Input />
                </Form.Item>
              </div>

              <Form.Item
                name="account_name"
                label="Tên chủ tài khoản"
                rules={[{ required: true, message: 'Nhập tên chủ tài khoản' }]}
                className="mb-4"
              >
                <Input className="uppercase" />
              </Form.Item>

              <div className="border border-gray-200 rounded-lg p-4 mt-6 bg-gray-50/50">
                <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                  <QrcodeOutlined /> Tùy biến hiển thị dưới mã QR
                </h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-6">
                    <Checkbox 
                      className="text-sm w-1/2" 
                      checked={previewData.show_amount} 
                      onChange={(e) => setPreviewData({...previewData, show_amount: e.target.checked})}
                    >
                      Hiển thị Số tiền
                    </Checkbox>
                    <Checkbox 
                      className="text-sm w-1/2" 
                      checked={previewData.show_account_name} 
                      onChange={(e) => setPreviewData({...previewData, show_account_name: e.target.checked})}
                    >
                      Hiển thị Tên chủ TK
                    </Checkbox>
                  </div>
                  <div className="flex items-center gap-6">
                    <Checkbox 
                      className="text-sm w-1/2" 
                      checked={previewData.show_account_no} 
                      onChange={(e) => setPreviewData({...previewData, show_account_no: e.target.checked})}
                    >
                      Hiển thị Số tài khoản
                    </Checkbox>
                    <Checkbox 
                      className="text-sm w-1/2" 
                      checked={previewData.show_bank_name} 
                      onChange={(e) => setPreviewData({...previewData, show_bank_name: e.target.checked})}
                    >
                      Hiển thị Tên Ngân hàng
                    </Checkbox>
                  </div>
                  <div className="flex items-center gap-6">
                    <Checkbox 
                      className="text-sm w-1/2" 
                      checked={previewData.show_add_info} 
                      onChange={(e) => setPreviewData({...previewData, show_add_info: e.target.checked})}
                    >
                      Hiển thị Nội dung CK
                    </Checkbox>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Xem trước */}
            <div className="w-[280px] shrink-0 border-l pl-8 flex flex-col items-center">
              <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Xem trước hiển thị</h4>
              {previewData.bank_id && previewData.account_no ? (
                <div className="text-center animate-fade-in w-full max-w-[240px]">
                  <div className="border p-2 rounded-xl bg-white shadow-sm inline-block mb-3">
                    <img
                      src={`https://img.vietqr.io/image/${previewData.bank_id}-${previewData.account_no}-qr_only.png?amount=100000&addInfo=BIZSAAS%201234&accountName=${encodeURIComponent(previewData.account_name || '')}`}
                      alt="VietQR Preview"
                      className="w-48 h-48"
                    />
                  </div>

                  <div className="text-[13px] border border-[#6b5eae] rounded-lg p-3 bg-[#f4f3fb] text-left">
                    {previewData.show_bank_name && (
                      <div className="mb-1"><span className="text-gray-500">Ngân hàng:</span> <span className="font-bold text-[#6b5eae]">{banks.find(b => b.value === previewData.bank_id)?.label?.split(' (')[0] || previewData.bank_id}</span></div>
                    )}
                    {previewData.show_amount && (
                      <div className="mb-1"><span className="text-gray-500">Số tiền:</span> <span className="font-bold text-red-600">100.000 đ</span></div>
                    )}
                    {previewData.show_account_name && (
                      <div className="mb-1"><span className="text-gray-500">Chủ TK:</span> <span className="font-bold uppercase">{previewData.account_name || 'NGUYEN VAN A'}</span></div>
                    )}
                    {previewData.show_account_no && (
                      <div className="mb-1"><span className="text-gray-500">Số TK:</span> <span className="font-bold">{previewData.account_no}</span></div>
                    )}
                    {previewData.show_add_info && (
                      <div><span className="text-gray-500">Nội dung CK:</span> <span className="font-bold">BIZSAAS 1234</span></div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 mt-10">
                  <QrcodeOutlined className="text-5xl mb-3" />
                  <div className="text-sm text-center">Vui lòng nhập Ngân hàng và<br />Số tài khoản để xem trước</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
            <Button onClick={() => setIsModalOpen(false)} size="large">Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading} className="bg-[#6b5eae]" size="large">
              Lưu cấu hình
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
