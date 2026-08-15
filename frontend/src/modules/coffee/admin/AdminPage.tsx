'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Input, Badge, Dropdown, notification } from 'antd';
import { io } from 'socket.io-client';
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ProjectOutlined,
  CreditCardOutlined,
  PlusOutlined,
  CoffeeOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  LockOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import axios from 'axios';

// Import Views
import ProductsView from './components/ProductsView';
import CategoriesView from './components/CategoriesView';
import ToppingsView from './components/ToppingsView';
import TablesView from './components/TablesView';
import OrdersView from './components/OrdersView';
import POSView from './components/POSView';
import SettingsView from './components/SettingsView';
import QRConfigsView from './components/QRConfigsView';

const { Header, Sider, Content } = Layout;

export default function AdminPage({ tenantId }: { tenantId: string }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  // Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [toppingGroups, setToppingGroups] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [qrConfigs, setQrConfigs] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [menuRes, tablesRes, ordersRes, settingsRes, qrConfigsRes] = await Promise.all([
        axios.get(`http://localhost:3001/api/tenant/${tenantId}/menu`, { headers: { 'x-tenant-id': tenantId } }),
        axios.get(`http://localhost:3001/api/tenant/${tenantId}/tables`, { headers: { 'x-tenant-id': tenantId } }),
        axios.get(`http://localhost:3001/api/tenant/${tenantId}/orders`, { headers: { 'x-tenant-id': tenantId } }),
        axios.get(`http://localhost:3001/api/tenant/${tenantId}/settings`, { headers: { 'x-tenant-id': tenantId } }),
        axios.get(`http://localhost:3001/api/tenant/${tenantId}/vietqr`, { headers: { 'x-tenant-id': tenantId } })
      ]);
      setCategories(menuRes.data.categories || []);
      setProducts(menuRes.data.products || []);
      setToppings(menuRes.data.toppings || []);
      setToppingGroups(menuRes.data.toppingGroups || []);
      setTables(tablesRes.data || []);
      setOrders(ordersRes.data || []);
      setSettings(settingsRes.data || {});
      setQrConfigs(qrConfigsRes.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu admin:', err);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = io('http://localhost:3001');
    
    socket.on('newOrder', () => {
      notification.success({
        title: 'Đơn hàng mới!',
        description: 'Bạn vừa nhận được một đơn hàng mới từ khách hàng.',
        placement: 'topRight',
      });
      fetchData();
    });

    socket.on('orderStatusChanged', () => {
      fetchData();
    });

    socket.on('menuUpdated', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, [tenantId]);

  const getMenuItemStyle = (key: string) => ({
    fontWeight: activeMenu === key ? 600 : 400,
    color: activeMenu === key ? '#8B5742' : undefined,
    backgroundColor: activeMenu === key ? '#fdf8f5' : undefined,
  });

  // Sidebar Menu Items
  const menuItems = [
    {
      type: 'group' as const, label: 'TỔNG QUAN', key: 'overview-group', children: [
        { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Thống kê chung', style: getMenuItemStyle('dashboard') },
      ]
    },
    {
      type: 'group' as const, label: 'QUẢN LÝ', key: 'management-group', children: [
        { key: 'pos', icon: <ShoppingCartOutlined />, label: 'POS Thu ngân', style: getMenuItemStyle('pos') },
        { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng', style: getMenuItemStyle('orders') },
        { key: 'products', icon: <CoffeeOutlined />, label: 'Sản phẩm', style: getMenuItemStyle('products') },
        { key: 'categories', icon: <BookOutlined />, label: 'Danh mục', style: getMenuItemStyle('categories') },
        { key: 'toppings', icon: <PlusOutlined />, label: 'Topping', style: getMenuItemStyle('toppings') },
        { key: 'tables', icon: <ProjectOutlined />, label: 'Quản lý Bàn', style: getMenuItemStyle('tables') },
      ]
    },
    {
      type: 'group' as const, label: 'HỆ THỐNG', key: 'system-group', children: [
        {
          key: 'settings_menu',
          icon: <SettingOutlined />,
          label: 'Cài đặt quán',
          children: [
            { key: 'settings', label: 'Cài đặt chung', style: getMenuItemStyle('settings') },
            { key: 'qr_configs', label: 'Quản lý mã QR', style: getMenuItemStyle('qr_configs') },
          ]
        }
      ]
    },
  ];

  // Render Dashboard
  const renderDashboard = () => (
    <>
      {/* STATS ROW */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-md p-6 shadow-sm border border-gray-50 flex items-center justify-between">
          <div className="w-14 h-14 rounded-full bg-[#f4f3fb] text-[#6b5eae] flex items-center justify-center text-2xl">
            <CreditCardOutlined />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">
              {orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + Number(o.total_price || 0), 0).toLocaleString('vi-VN')} đ
            </div>
            <div className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Doanh thu</div>
          </div>
        </div>
        <div className="bg-white rounded-md p-6 shadow-sm border border-gray-50 flex items-center justify-between">
          <div className="w-14 h-14 rounded-full bg-[#f2f9f9] text-[#4fc6e1] flex items-center justify-center text-2xl">
            <ShoppingCartOutlined />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
            <div className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Đơn hàng</div>
          </div>
        </div>
        <div className="bg-white rounded-md p-6 shadow-sm border border-gray-50 flex items-center justify-between">
          <div className="w-14 h-14 rounded-full bg-[#f2f6fa] text-[#1abc9c] flex items-center justify-center text-2xl">
            <ProjectOutlined />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{tables.length}</div>
            <div className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Tổng số bàn</div>
          </div>
        </div>
        <div className="bg-white rounded-md p-6 shadow-sm border border-gray-50 flex items-center justify-between">
          <div className="w-14 h-14 rounded-full bg-[#fef8f3] text-[#f7b84b] flex items-center justify-center text-2xl">
            <CoffeeOutlined />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{products.length}</div>
            <div className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Sản phẩm</div>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS ROW */}
      <div className="bg-white rounded-md shadow-sm border border-gray-50 p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">Các Đơn Hàng Gần Đây</h3>
        {orders.slice(0, 5).map(order => (
          <div key={order.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
            <div>
              <div className="font-semibold text-gray-700">Đơn #{order.id} - {order.table?.name || 'Mang đi'}</div>
              <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('vi-VN')}</div>
            </div>
            <div>
              <Badge status={order.status === 'PENDING' ? 'warning' : order.status === 'SERVED' ? 'success' : order.status === 'PAID' ? 'success' : 'default'} text={order.status} />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#f3f4f7] font-sans">
      {/* SIDEBAR */}
      <Sider
        width={260}
        collapsedWidth={80}
        collapsed={collapsed}
        theme="light"
        className="shadow-sm border-r border-gray-100 z-10"
        style={{ height: '100vh', overflowY: 'auto' }}
      >
        <div className={`h-[64px] flex items-center border-b border-gray-700 sticky top-0 bg-[#0f172a] z-10 ${collapsed ? 'justify-center px-0' : 'px-6'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#6A5750] to-[#8B5742] flex items-center justify-center text-white font-bold text-lg shrink-0">B</div>
            {!collapsed && <span className="font-bold text-xl tracking-tight text-white">UBOLD</span>}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={({ key }) => setActiveMenu(key)}
          items={menuItems}
          className="border-r-0 py-4 custom-sidebar-menu"
          style={{ backgroundColor: 'transparent' }}
        />
      </Sider>

      {/* MAIN LAYOUT */}
      <Layout className="bg-transparent flex-1">
        {/* HEADER */}
        <Header style={{ padding: "0 25px" }} className="h-[64px] bg-[#0f172a] flex items-center justify-between shadow-sm border-b border-gray-800 z-10">
          <div className="flex items-center gap-4">
            <div
              className="text-gray-300 hover:text-white cursor-pointer text-xl"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
          </div>

          <div className="flex items-center gap-5 h-full">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Quick Search..."
              className="w-56 md:w-64 rounded bg-white border-transparent focus:border-gray-300 focus:shadow-none text-gray-700"
            />
            <div className="flex items-center gap-5 text-[#98a6ad] text-lg ml-2">
              {/* Nút Dark Mode (SVG tùy chỉnh) */}
              <div className="cursor-pointer hover:text-white flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              </div>
              <Badge count={orders.filter(o => o.status === 'PENDING').length} size="small" color="#f1556c" className="custom-bell-wrapper cursor-pointer">
                <BellOutlined className="text-xl custom-bell-icon" />
              </Badge>
            </div>

            <div className="flex items-center gap-2 border-l pl-4 pr-6 border-gray-700 hover:bg-[#1e293b] h-full transition-colors ml-2">
              <Avatar src="https://i.pravatar.cc/150?img=32" />
              <Dropdown
                menu={{
                  items: [
                    { key: 'header', label: <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider my-1">Welcome back!</div>, disabled: true },
                    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
                    { key: 'notifications', icon: <BellOutlined />, label: 'Notifications' },
                    { key: 'balance', icon: <CreditCardOutlined />, label: 'Balance: $985.25' },
                    { key: 'settings', icon: <SettingOutlined />, label: 'Account Settings' },
                    { key: 'support', icon: <CustomerServiceOutlined />, label: 'Support Center' },
                    { type: 'divider' },
                    { key: 'lock', icon: <LockOutlined />, label: 'Lock Screen' },
                    { key: 'logout', icon: <LogoutOutlined className="text-red-500" />, label: <span className="text-red-500 font-medium">Log Out</span> },
                  ]
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <div className="flex flex-col leading-tight cursor-pointer">
                  <span className="text-sm font-semibold text-white">Geneva</span>
                  <span className="text-xs font-semibold text-gray-400">Quản lý</span>
                </div>
              </Dropdown>
            </div>
          </div>
        </Header>

        {/* CONTENT */}
        <Content className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 70px)' }}>
          {/* Breadcrumb & Title */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 m-0 capitalize">
              {{
                dashboard: 'Bảng điều khiển',
                pos: 'POS Thu ngân',
                products: 'Sản phẩm',
                categories: 'Danh mục',
                toppings: 'Topping',
                tables: 'Phòng Bàn',
                orders: 'Đơn hàng',
                settings: 'Cài đặt chung',
                qr_configs: 'Thiết lập QR',
              }[activeMenu] || activeMenu}
            </h2>
            <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
              <span>UBold</span> <span className="text-gray-300">›</span>
              <span>Admin</span> <span className="text-gray-300">›</span>
              <span className="text-gray-400 capitalize">
                {{
                  dashboard: 'Bảng điều khiển',
                  pos: 'POS Thu ngân',
                  products: 'Sản phẩm',
                  categories: 'Danh mục',
                  toppings: 'Topping',
                  tables: 'Phòng Bàn',
                  orders: 'Đơn hàng',
                  settings: 'Cài đặt chung',
                  qr_configs: 'Thiết lập QR',
                }[activeMenu] || activeMenu}
              </span>
            </div>
          </div>

          {/* DYNAMIC VIEWS */}
          {activeMenu === 'dashboard' && renderDashboard()}
          {activeMenu === 'pos' && <POSView tenantId={tenantId} products={products} categories={categories} toppings={toppings} tables={tables} settings={settings} qrConfigs={qrConfigs} onRefresh={fetchData} />}
          {activeMenu === 'products' && <ProductsView tenantId={tenantId} products={products} categories={categories} toppings={toppings} toppingGroups={toppingGroups} onRefresh={fetchData} />}
          {activeMenu === 'categories' && <CategoriesView tenantId={tenantId} categories={categories} onRefresh={fetchData} />}
          {activeMenu === 'toppings' && <ToppingsView tenantId={tenantId} toppings={toppings} toppingGroups={toppingGroups} onRefresh={fetchData} />}
          {activeMenu === 'tables' && <TablesView tenantId={tenantId} tables={tables} onRefresh={fetchData} />}
          {activeMenu === 'orders' && <OrdersView tenantId={tenantId} orders={orders} onRefresh={fetchData} />}
          {activeMenu === 'settings' && <SettingsView tenantId={tenantId} settings={settings} onRefresh={fetchData} />}
          {activeMenu === 'qr_configs' && <QRConfigsView tenantId={tenantId} qrConfigs={qrConfigs} onRefresh={fetchData} />}

        </Content>
      </Layout>

      <style>{`
        .custom-sidebar-menu .ant-menu-item-group-title {
          font-size: 11px;
          letter-spacing: 1px;
          color: #98a6ad;
          font-weight: 600;
          margin-top: 15px;
        }
        .custom-sidebar-menu .ant-menu-item {
          color: #6e768e;
          font-weight: 500;
          margin-top: 2px !important;
          margin-bottom: 2px !important;
        }
        .custom-sidebar-menu .ant-menu-item-selected {
          background-color: transparent !important;
        }
        .custom-sidebar-menu .ant-menu-item:hover {
          color: #8B5742 !important;
        }
        .custom-admin-table .ant-table-thead > tr > th {
          background: white;
          color: #98a6ad;
          font-size: 12px;
          font-weight: 600;
          border-bottom: 1px solid #f1f3fa;
        }
        .custom-admin-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f3fa;
          padding: 8px 16px;
        }
        .custom-admin-table .ant-table-wrapper .ant-table {
          border: none;
        }
        .custom-bell-icon {
          color: #98a6ad !important;
          font-size: 18px !important;
          transition: color 0.3s;
        }
        .custom-bell-wrapper:hover .custom-bell-icon {
          color: white !important;
        }
        .custom-sidebar-menu.ant-menu-inline-collapsed .ant-menu-item-group-title {
          display: none !important;
        }
        .custom-sidebar-menu .ant-menu-item .ant-menu-item-icon,
        .custom-sidebar-menu .ant-menu-item .anticon,
        .custom-sidebar-menu .ant-menu-submenu-title .ant-menu-item-icon,
        .custom-sidebar-menu .ant-menu-submenu-title .anticon {
          font-size: 20px !important;
          min-width: 20px !important;
          width: 20px !important;
        }
        .custom-sidebar-menu .ant-menu-item .anticon svg,
        .custom-sidebar-menu .ant-menu-item .ant-menu-item-icon svg {
          width: 20px !important;
          height: 20px !important;
          min-width: 20px !important;
        }
      `}</style>
    </div >
  );
}
