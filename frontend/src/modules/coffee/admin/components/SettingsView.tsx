import React, { useState } from 'react';
import { Form, Input, Button, message, Divider, Select } from 'antd';
import { SaveOutlined, BankOutlined, ShopOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function SettingsView({ tenantId, settings, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Load current settings into form
  React.useEffect(() => {
    form.setFieldsValue({
      vietqr_bank_id: settings.vietqr_bank_id || '970436', // Default VCB
      vietqr_account_no: settings.vietqr_account_no || '',
      vietqr_account_name: settings.vietqr_account_name || '',
      store_name: settings.store_name || '',
      store_address: settings.store_address || '',
    });
  }, [settings, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:3001/api/tenant/${tenantId}/settings`, values, {
        headers: { 'x-tenant-id': tenantId }
      });
      message.success('Cập nhật cài đặt thành công');
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  // Danh sách ngân hàng phổ biến (Napas BIN)
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

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-50 p-6 max-w-3xl">
      <h3 className="text-base font-bold text-gray-800 mb-6">Cài đặt Hệ thống</h3>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
      >
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#6b5eae] font-bold text-lg mb-4">
            <ShopOutlined /> Thông tin chung
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="store_name" label="Tên Quán">
              <Input placeholder="Ví dụ: BizSaaS Coffee" size="large" />
            </Form.Item>
            <Form.Item name="store_address" label="Địa chỉ">
              <Input placeholder="Ví dụ: 123 Đường ABC, Quận 1" size="large" />
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
            className="bg-[#6b5eae]"
          >
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </div>
  );
}
