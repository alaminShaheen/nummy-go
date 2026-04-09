const fs = require('fs');

const files = [
  'apps/web/src/hooks/useDashboardOrders.ts',
  'apps/web/src/hooks/useOrders.ts',
  'apps/web/src/components/CartDrawer.tsx',
  'apps/web/src/components/VendorStorefront.tsx',
  'apps/web/src/components/MenuItemEditor.tsx',
  'apps/web/src/app/checkout/page.tsx',
  'apps/web/src/app/customer/page.tsx',
  'apps/web/src/app/track/[sessionId]/page.tsx',
  'apps/web/src/app/tenant/(protected)/orders/page.tsx',
  'apps/web/src/app/tenant/(protected)/orders/components/OrderActions.tsx',
  'apps/web/src/app/tenant/(protected)/menu/page.tsx'
];

const replacements = {
  'trpc.tenant.getDashboardOrders': 'trpc.order.getDashboardOrders',
  'trpc.customer.getOrders': 'trpc.order.getCustomerOrders',
  'trpc.customer.requestModification': 'trpc.order.requestModification',
  'trpc.tenant.getStorefrontMenu': 'trpc.menu.getStorefrontMenu',
  'trpc.tenant.getStorefrontCategories': 'trpc.category.getStorefrontCategories',
  'trpc.customer.getOrderDetails': 'trpc.order.getOrderDetails',
  'trpc.tenant.getMenuCategories': 'trpc.category.getMenuCategories',
  'trpc.tenant.createMenuCategory': 'trpc.category.createMenuCategory',
  'trpc.tenant.createMenuItem': 'trpc.menu.createMenuItem',
  'trpc.tenant.updateMenuItem': 'trpc.menu.updateMenuItem',
  'trpc.tenant.deleteMenuItem': 'trpc.menu.deleteMenuItem',
  'trpc.customer.checkout': 'trpc.order.checkout',
  'trpc.customer.getCheckoutGroup': 'trpc.order.getCheckoutGroup',
  'trpc.tenant.reviewModification': 'trpc.order.reviewModification',
  'trpc.tenant.getModificationDetails': 'trpc.order.getModificationDetails',
  'trpc.tenant.getMenuItems': 'trpc.menu.getMenuItems',
  'trpc.tenant.updateOrderStatus': 'trpc.order.updateOrderStatus',
  'utils.tenant.getDashboardOrders': 'utils.order.getDashboardOrders',
  'utils.customer.getOrders': 'utils.order.getCustomerOrders',
  'utils.tenant.getStorefrontMenu': 'utils.menu.getStorefrontMenu',
  'utils.tenant.getStorefrontCategories': 'utils.category.getStorefrontCategories',
  'utils.tenant.getMenuCategories': 'utils.category.getMenuCategories',
  'utils.tenant.getMenuItems': 'utils.menu.getMenuItems',
  'utils.tenant.getModificationDetails': 'utils.order.getModificationDetails',
};

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [key, value] of Object.entries(replacements)) {
    if (content.includes(key)) {
      content = content.split(key).join(value);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
