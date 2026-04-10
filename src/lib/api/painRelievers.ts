import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createItem, deleteItem, readItems, updateItem } from '@directus/sdk'
import { directus, type ContentItem } from '#/lib/directus'

// ── Pain Relievers (solutions) ────────────────────────────────────────────────

export function usePainRelievers(prefix = '') {
  const type = prefix ? `${prefix}_pain_reliever` : 'pain_reliever'
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

export function useUpdatePainReliever(prefix = '') {
  const type = prefix ? `${prefix}_pain_reliever` : 'pain_reliever'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

export function useAddPainReliever(prefix = '') {
  const type = prefix ? `${prefix}_pain_reliever` : 'pain_reliever'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ContentItem, 'id'>) =>
      directus.request(createItem('contents', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

export function useDeletePainReliever(prefix = '') {
  const type = prefix ? `${prefix}_pain_reliever` : 'pain_reliever'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => directus.request(deleteItem('contents', id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

