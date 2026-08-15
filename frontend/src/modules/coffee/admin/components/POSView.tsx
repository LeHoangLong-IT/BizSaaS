import React, { useState } from 'react';
import { Input, Button, message, Drawer, Select, Modal, Tag, Switch, Badge } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, QrcodeOutlined, CoffeeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function POSView({ tenantId, products, categories, toppings, tables, settings, qrConfigs, onRefresh }: any) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || null);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Selected Product for Customization
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Size M');
  const [selectedSugar, setSelectedSugar] = useState('100% Đường');
  const [selectedIce, setSelectedIce] = useState('Đá bình thường');
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
  const [customerNote, setCustomerNote] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Checkout states
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isTakeaway, setIsTakeaway] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState('CASH'); // CASH or BANK

  // VietQR state
  const [vietQRUrl, setVietQRUrl] = useState('');

  const filteredProducts = products.filter((p: any) =>
    (activeCategory ? p.category?.id === activeCategory : true) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCustomization = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedSize('Size M');
    setSelectedSugar('100% Đường');
    setSelectedIce('Đá bình thường');
    setSelectedToppings([]);
    setCustomerNote('');
    setIsModalOpen(true);
  };

  const addToCart = () => {
    const toppingTotal = selectedToppings.reduce((acc, tId) => {
      const top = toppings.find((t: any) => t.id === tId);
      return acc + (top ? Number(top.price) : 0);
    }, 0);

    const sizeAdd = selectedSize === 'Size L' ? 6000 : selectedSize === 'Size XL' ? 10000 : 0;
    const finalPrice = Number(selectedProduct.price) + sizeAdd + toppingTotal;

    setCart([
      ...cart,
      {
        ...selectedProduct,
        qty: quantity,
        size: selectedSize,
        sugar: selectedSugar,
        ice: selectedIce,
        toppings: selectedToppings,
        customerNote: customerNote,
        finalPrice
      }
    ]);
    message.success(`Đã thêm ${selectedProduct.name}`);
    setIsModalOpen(false);
  };

  const updateCartQty = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].qty += delta;
    if (newCart[index].qty <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.qty), 0);

  const handleCheckoutClick = () => {
    if (cart.length === 0) return message.warning('Giỏ hàng trống');
    setIsCheckoutModalOpen(true);
    setCheckoutMethod('CASH');

    // Tìm cấu hình QR mặc định
    const activeQR = qrConfigs?.find((c: any) => c.is_active);

    if (activeQR && activeQR.bank_id && activeQR.account_no) {
      const amount = cartTotal;
      const addInfo = `BIZSAAS ${Math.floor(Math.random() * 10000)}`;

      // Template=qr_only để tự custom text bên ngoài
      setVietQRUrl(`https://img.vietqr.io/image/${activeQR.bank_id}-${activeQR.account_no}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(activeQR.account_name || '')}`);
    } else {
      setVietQRUrl(''); // Reset nếu chưa có QR active
    }
  };

  const confirmOrder = async () => {
    try {
      await axios.post(`http://localhost:3001/api/tenant/${tenantId}/order`, {
        tableId: isTakeaway ? null : selectedTable,
        orderType: isTakeaway ? 'TAKEAWAY' : 'DINE_IN',
        items: cart.map(c => ({
          productId: c.id,
          quantity: c.qty,
          toppingIds: c.toppings,
          note: `Size: ${c.size}, ${c.sugar}, ${c.ice}${c.customerNote ? ' | ' + c.customerNote : ''}`,
          finalPrice: c.finalPrice
        }))
      }, { headers: { 'x-tenant-id': tenantId } });

      message.success('Thanh toán và tạo đơn thành công!');
      setCart([]);
      setIsCheckoutModalOpen(false);
      onRefresh();
    } catch (err) {
      message.error('Lỗi khi tạo đơn');
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-gray-50 -m-6 rounded-md overflow-hidden">
      {/* LEFT: Menu */}
      <div className="flex-1 flex flex-col p-4 border-r border-gray-200 bg-white">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
          <button
            className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold ${activeCategory === null ? 'bg-[#6b5eae] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveCategory(null)}
          >
            Tất cả
          </button>
          {categories.map((c: any) => (
            <button
              key={c.id}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold ${activeCategory === c.id ? 'bg-[#6b5eae] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm món..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size="large"
            className="rounded-lg"
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 content-start">
          {filteredProducts.map((p: any) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-[#6b5eae] transition-all duration-300 group flex flex-col"
              onClick={() => openCustomization(p)}
            >
              <div className="h-32 bg-gray-50 flex items-center justify-center p-2 relative overflow-hidden shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-md group-hover:scale-105 transition duration-300" />
                ) : (
                  <CoffeeOutlined className="text-4xl text-gray-300" />
                )}
              </div>
              <div className="p-3 text-center flex flex-col flex-1 justify-center">
                <div className="font-bold text-gray-800 text-[13px] leading-tight line-clamp-2 group-hover:text-[#6b5eae] transition-colors" title={p.name}>{p.name}</div>
                <div className="text-[#6b5eae] font-bold text-sm mt-1">{Number(p.price).toLocaleString()}đ</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-[380px] bg-white flex flex-col">
        <div className="p-4 bg-[#6b5eae] text-white font-bold text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCartOutlined /> Giỏ hàng
          </div>
          <Badge count={cart.length} showZero color="#f7b84b" />
        </div>

        {/* Order Info (Table / Takeaway) */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-700">Loại đơn:</span>
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                className={`px-3 py-1 text-xs font-bold rounded-md ${isTakeaway ? 'bg-white text-[#6b5eae] shadow-sm' : 'text-gray-500'}`}
                onClick={() => { setIsTakeaway(true); setSelectedTable(null); }}
              >
                Mang đi
              </button>
              <button
                className={`px-3 py-1 text-xs font-bold rounded-md ${!isTakeaway ? 'bg-white text-[#6b5eae] shadow-sm' : 'text-gray-500'}`}
                onClick={() => setIsTakeaway(false)}
              >
                Tại bàn
              </button>
            </div>
          </div>

          {!isTakeaway && (
            <div className="mt-2 animate-fade-in">
              <Select
                placeholder="Chọn Bàn"
                style={{ width: '100%' }}
                value={selectedTable}
                onChange={setSelectedTable}
                options={tables.map((t: any) => ({
                  value: t.id,
                  label: `${t.name} ${t.status === 'OCCUPIED' ? '(Đang phục vụ)' : '(Trống)'}`,
                  disabled: t.status === 'OCCUPIED'
                }))}
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCartOutlined className="text-5xl mb-2 opacity-50" />
              <p>Chưa có món nào</p>
            </div>
          ) : (
            cart.map((c, i) => (
              <div key={i} className="flex gap-3 bg-white border border-gray-100 rounded-lg p-3 relative group">
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-sm leading-tight">{c.name}</div>
                  <div className="text-xs text-gray-500 my-1">
                    {[c.size, c.sugar, c.ice, ...c.toppings.map((tid: number) => toppings.find((t: any) => t.id === tid)?.name)].filter(Boolean).join(', ')}
                  </div>
                  <div className="font-bold text-[#6b5eae]">{Number(c.finalPrice).toLocaleString()}đ</div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button className="text-xs text-red-400 hover:text-red-600 mb-2" onClick={() => updateCartQty(i, -c.qty)}>Xóa</button>
                  <div className="flex items-center bg-gray-100 rounded">
                    <button className="px-2 py-1 hover:bg-gray-200" onClick={() => updateCartQty(i, -1)}>-</button>
                    <span className="font-bold text-xs px-1">{c.qty}</span>
                    <button className="px-2 py-1 hover:bg-gray-200" onClick={() => updateCartQty(i, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between text-gray-500 font-semibold mb-2">
            <span>Tổng số lượng</span>
            <span>{cart.reduce((s, c) => s + c.qty, 0)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-[#8B5742] mb-4">
            <span>Tổng cộng</span>
            <span>{cartTotal.toLocaleString()} đ</span>
          </div>
          <Button
            type="primary"
            size="large"
            block
            className="h-12 text-lg font-bold bg-[#1abc9c] border-none hover:bg-[#15a085]"
            onClick={handleCheckoutClick}
            disabled={cart.length === 0 || (!isTakeaway && !selectedTable)}
          >
            Thanh Toán
          </Button>
        </div>
      </div>

      {/* Modal Customize */}
      <Modal
        title={<div className="text-lg text-[#6b5eae]"><CoffeeOutlined className="mr-2" /> Tùy chỉnh món</div>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >
        {selectedProduct && (
          <div>
            <div className="flex items-center gap-4 mb-6 pb-4 border-b">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                {selectedProduct.image_url && <img src={selectedProduct.image_url} alt="" className="h-full object-contain" />}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{selectedProduct.name}</h3>
                <div className="text-[#6b5eae] font-bold">{Number(selectedProduct.price).toLocaleString()}đ</div>
              </div>
            </div>

            <div className="mb-4">
              <label className="font-semibold block mb-2">Size</label>
              <div className="flex gap-2">
                {['Size M', 'Size L (+6.000đ)', 'Size XL (+10.000đ)'].map(size => {
                  const s = size.split(' ')[0] + ' ' + size.split(' ')[1];
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded border text-sm font-semibold transition ${selectedSize === s ? 'bg-[#6b5eae] text-white border-[#6b5eae]' : 'border-gray-200 text-gray-600 hover:border-[#6b5eae]'}`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-2">Đường</label>
                <Select value={selectedSugar} onChange={setSelectedSugar} className="w-full" options={['100% Đường', '70% Đường', '50% Đường', '30% Đường', 'Không Đường'].map(x => ({ label: x, value: x }))} />
              </div>
              <div>
                <label className="font-semibold block mb-2">Đá</label>
                <Select value={selectedIce} onChange={setSelectedIce} className="w-full" options={['Đá bình thường', 'Ít đá', 'Không đá', 'Đá riêng'].map(x => ({ label: x, value: x }))} />
              </div>
            </div>

            <div className="mb-4">
              <label className="font-semibold block mb-2">Topping</label>
              <div className="flex flex-wrap gap-2">
                {toppings.map((t: any) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (selectedToppings.includes(t.id)) setSelectedToppings(selectedToppings.filter(id => id !== t.id));
                      else setSelectedToppings([...selectedToppings, t.id]);
                    }}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1 transition ${selectedToppings.includes(t.id) ? 'bg-[#f4f3fb] border-[#6b5eae] text-[#6b5eae]' : 'border-gray-200 text-gray-500'}`}
                  >
                    {t.name} (+{Number(t.price).toLocaleString()}đ)
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-6 border-t">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button className="w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 rounded" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button className="w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 rounded" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <Button type="primary" className="bg-[#6b5eae]" onClick={addToCart}>Thêm vào đơn</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Checkout */}
      <Modal
        title={<div className="text-xl font-bold">Xác nhận thanh toán</div>}
        open={isCheckoutModalOpen}
        onCancel={() => setIsCheckoutModalOpen(false)}
        footer={null}
        width={700}
        centered
      >
        <div className="flex gap-6 mt-4">
          <div className="w-1/2 border-r pr-6">
            <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Thông tin đơn</h4>
            <div className="flex justify-between mb-2"><span className="text-gray-600">Loại:</span> <span className="font-bold">{isTakeaway ? 'Mang đi' : `Tại bàn: ${tables.find((t: any) => t.id === selectedTable)?.name}`}</span></div>
            <div className="flex justify-between mb-2"><span className="text-gray-600">Số lượng:</span> <span className="font-bold">{cart.reduce((s, c) => s + c.qty, 0)} món</span></div>
            <div className="flex justify-between mt-4 text-xl font-bold text-[#8B5742]"><span className="text-gray-800">Tổng thu:</span> <span>{cartTotal.toLocaleString()} đ</span></div>

            <h4 className="font-bold text-gray-500 mt-6 mb-4 uppercase text-xs tracking-wider">Phương thức</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`flex flex-col items-center justify-center p-4 border rounded-xl font-bold transition-all ${checkoutMethod === 'CASH' ? 'border-green-500 bg-green-50 text-green-700 shadow-sm scale-105' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setCheckoutMethod('CASH')}
              >
                Tiền mặt
              </button>
              <button
                className={`flex flex-col items-center justify-center p-4 border rounded-xl font-bold transition-all ${checkoutMethod === 'BANK' ? 'border-[#6b5eae] bg-[#f4f3fb] text-[#6b5eae] shadow-sm scale-105' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setCheckoutMethod('BANK')}
              >
                QR
              </button>
            </div>
          </div>

          <div className="w-1/2 flex flex-col items-center justify-center">
            {checkoutMethod === 'BANK' ? (
              vietQRUrl ? (
                <div className="text-center animate-fade-in w-full max-w-[280px]">
                  <div className="border p-2 rounded-xl bg-white shadow-sm inline-block mb-3">
                    <img src={vietQRUrl} alt="VietQR" className="w-48 h-48" />
                  </div>

                  <div className="text-[13px] border border-[#6b5eae] rounded-lg p-3 bg-[#f4f3fb] text-left">
                    {qrConfigs?.find((c: any) => c.is_active)?.show_bank_name && (
                      <div className="mb-1"><span className="text-gray-500">Ngân hàng:</span> <span className="font-bold text-[#6b5eae]">{banks.find(b => b.value === qrConfigs.find((c: any) => c.is_active).bank_id)?.label?.split(' (')[0] || qrConfigs.find((c: any) => c.is_active).bank_id}</span></div>
                    )}
                    {qrConfigs?.find((c: any) => c.is_active)?.show_amount && (
                      <div className="mb-1"><span className="text-gray-500">Số tiền:</span> <span className="font-bold text-red-600">{cartTotal.toLocaleString()} đ</span></div>
                    )}
                    {qrConfigs?.find((c: any) => c.is_active)?.show_account_name && (
                      <div className="mb-1"><span className="text-gray-500">Chủ TK:</span> <span className="font-bold uppercase">{qrConfigs.find((c: any) => c.is_active).account_name}</span></div>
                    )}
                    {qrConfigs?.find((c: any) => c.is_active)?.show_account_no && (
                      <div className="mb-1"><span className="text-gray-500">Số TK:</span> <span className="font-bold">{qrConfigs.find((c: any) => c.is_active).account_no}</span></div>
                    )}
                    {qrConfigs?.find((c: any) => c.is_active)?.show_add_info && (
                      <div><span className="text-gray-500">Nội dung CK:</span> <span className="font-bold">BIZSAAS...</span></div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center animate-fade-in text-red-500">
                  <QrcodeOutlined className="text-5xl mb-3 opacity-80" />
                  <div>Quán chưa cài đặt Ngân hàng nhận tiền.</div>
                  <div className="text-xs text-gray-500 mt-1">Vui lòng vào "Cài đặt quán" để thiết lập.</div>
                </div>
              )
            ) : (
              <div className="text-center animate-fade-in text-gray-500">
                <CheckCircleOutlined className="text-5xl text-green-500 mb-3 opacity-80" />
                <div>Thu tiền mặt từ khách</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t flex justify-end gap-3">
          <Button onClick={() => setIsCheckoutModalOpen(false)}>Hủy</Button>
          <Button type="primary" size="large" className="bg-[#1abc9c]" onClick={confirmOrder}>Hoàn tất & In Bill</Button>
        </div>
      </Modal>
    </div>
  );
}
