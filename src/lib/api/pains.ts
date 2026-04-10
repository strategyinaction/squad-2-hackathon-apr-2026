import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createItem, deleteItem, readItems, updateItem } from '@directus/sdk'
import { directus, type ContentItem } from '#/lib/directus'

// ── Pain section (subtitle / description) ─────────────────────────────────────

export function usePainSection(prefix = '') {
  const type = prefix ? `${prefix}_pain_section` : 'pain_section'
  return useQuery({
    queryKey: [type],
    queryFn: async () => {
      const items = await directus.request(
        readItems('contents', { filter: { type: { _eq: type } }, limit: 1 }),
      )
      return items[0] ?? null
    },
  })
}

export function useUpdatePainSection(prefix = '') {
  const type = prefix ? `${prefix}_pain_section` : 'pain_section'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

export function useAddPainSection(prefix = '') {
  const type = prefix ? `${prefix}_pain_section` : 'pain_section'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ContentItem, 'id'>) =>
      directus.request(createItem('contents', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

// ── Pains ─────────────────────────────────────────────────────────────────────

export function usePains(prefix = '') {
  const type = prefix ? `${prefix}_pain` : 'pain'
  return useQuery({
    queryKey: [type],
    queryFn: () =>
      directus.request(
        readItems('contents', {
          filter: { type: { _eq: type } },
          sort: ['order_value'],
        }),
      ),
  })
}

export function useUpdatePain(prefix = '') {
  const type = prefix ? `${prefix}_pain` : 'pain'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

export function useAddPain(prefix = '') {
  const type = prefix ? `${prefix}_pain` : 'pain'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ContentItem, 'id'>) =>
      directus.request(createItem('contents', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

export function useDeletePain(prefix = '') {
  const type = prefix ? `${prefix}_pain` : 'pain'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => directus.request(deleteItem('contents', id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

