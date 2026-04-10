import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createItem, readItems, updateItem } from '@directus/sdk'
import { directus, type ContentItem } from '#/lib/directus'

export function useHeaderCards() {
  return useQuery({
    queryKey: ['header_cards'],
    queryFn: () =>
      directus.request(
        readItems('contents', {
          filter: { type: { _eq: 'header_card' } },
          sort: ['order_value'],
        }),
      ),
  })
}

export function useUpdateHeaderCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header_cards'] })
    },
  })
}

export function useAddHeaderCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ContentItem, 'id'>) =>
      directus.request(createItem('contents', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header_cards'] })
    },
  })
}
