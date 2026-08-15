const fs = require('fs');
const path = 'd:/Bobs/Bobs/2026/BizSaaS/frontend/src/modules/coffee/customer/MenuPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const stateInsertion = `  const [view, setView] = useState<'menu' | 'cart' | 'favorite'>('menu');
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(\`http://localhost:3001/api/tenant/\${tenantId}/menu\`, {
          headers: { 'x-tenant-id': tenantId }
        });
        setCategories(res.data.categories || []);
        setProducts(res.data.products || []);
        setToppings(res.data.toppings || []);
        if (res.data.categories && res.data.categories.length > 0) setActiveCategory(res.data.categories[0].id);
      } catch (err) {
        console.error('Lỗi tải menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [tenantId]);`;

content = content.replace("  const [view, setView] = useState<'menu' | 'cart' | 'favorite'>('menu');", stateInsertion);

content = content.replace(/MOCK_CATEGORIES/g, 'categories');
content = content.replace(/MOCK_PRODUCTS/g, 'products');
content = content.replace(/MOCK_TOPPINGS/g, 'toppings');

content = content.replace(/>{category\.icon}</g, '>{getIconComponent(category.icon)}<');

if (!content.includes('useEffect')) {
   content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated MenuPage.tsx to use DB data!');
