import { ulid } from 'ulidx';
import {
  createMenuItem,
  getAllMenuItemsByTenant,
  getMenuItemsByTenant,
  updateMenuItem,
  deleteMenuItem,
  createMenuItemCategory,
  getMenuItemCategoriesByTenant
} from '@nummygo/shared/db/queries';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateMenuItemCategoryDto
} from '@nummygo/shared/models/dtos';

export async function addMenuItem(data: CreateMenuItemDto) {
  const record = {
    ...data,
    id: ulid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return await createMenuItem(record);
}

export async function editMenuItem(id: string, data: UpdateMenuItemDto) {
  return await updateMenuItem(id, data);
}

export async function removeMenuItem(id: string) {
  return await deleteMenuItem(id);
}

export async function fetchAllTenantMenuItems(tenantId: string) {
  return await getAllMenuItemsByTenant(tenantId);
}

export async function fetchStorefrontMenu(tenantId: string) {
  return await getMenuItemsByTenant(tenantId);
}

export async function addMenuCategory(data: CreateMenuItemCategoryDto) {
  const record = {
    ...data,
    id: ulid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return await createMenuItemCategory(record);
}

export async function fetchAllTenantMenuCategories(tenantId: string) {
  return await getMenuItemCategoriesByTenant(tenantId);
}
