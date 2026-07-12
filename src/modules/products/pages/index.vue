<script setup lang="ts">
import { productsService, type Product, type ProductForm } from '../services/products.service'

const { t } = useI18n()

const form = reactive<ProductForm>({
  name: '',
  sku: '',
  price: 0,
  status: 'active',
})

const {
  items,
  isLoading,
  isError,
  error,
  search,
  page,
  totalPages,
  setPage,
  mode,
  selectedItem,
  isFormOpen,
  isSubmitting,
  openCreate,
  openEdit,
  closeForm,
  submitForm,
  confirmDelete,
  refetch,
} = useCrudResource<Product, ProductForm, ProductForm>({
  queryKey: 'products',
  list: (params) => productsService.list(params),
  create: (payload) => productsService.create(payload),
  update: (id, payload) => productsService.update(id, payload),
  remove: (id) => productsService.remove(id),
  getItemLabel: (item) => item.name,
})

const columns: { key: keyof Product & string; label: string; sortable?: boolean }[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'sku', label: 'SKU' },
  { key: 'price', label: 'Price' },
  { key: 'status', label: 'Status' },
]

watch(mode, (next) => {
  if (next === 'create') {
    Object.assign(form, { name: '', sku: '', price: 0, status: 'active' })
    return
  }
  if (next === 'edit' && selectedItem.value) {
    Object.assign(form, {
      name: selectedItem.value.name,
      sku: selectedItem.value.sku,
      price: selectedItem.value.price,
      status: selectedItem.value.status,
    })
  }
})

function onSearch(query: string) {
  search.value = query
}

async function onSubmit() {
  await submitForm({ ...form })
}

definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'products.view',
})
</script>

<template>
  <BaseErrorState
    v-if="isError"
    :title="error?.message ?? t('common.noResults')"
    @retry="refetch()"
  />

  <template v-else>
    <CrudListPage
      :title="t('nav.products')"
      :columns="columns"
      :data="items"
      :loading="isLoading"
      :page="page"
      :total-pages="totalPages"
      :search="search"
      @update:page="setPage"
      @update:search="onSearch"
      @create="openCreate"
      @edit="openEdit"
      @delete="confirmDelete"
    />

    <CrudFormModal
      v-model:open="isFormOpen"
      :mode="mode"
      :submitting="isSubmitting"
      @close="closeForm"
      @submit="onSubmit"
    >
      <BaseInput v-model="form.name" label="Name" required />
      <BaseInput v-model="form.sku" label="SKU" required />
      <BaseInput v-model.number="form.price" label="Price" type="number" required />
      <BaseSelect
        v-model="form.status"
        label="Status"
        :options="[
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ]"
      />
    </CrudFormModal>
  </template>
</template>
