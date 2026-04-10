import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createItem, readItems, updateItem } from '@directus/sdk'
import { directus, type ContentItem } from '#/lib/directus'

export function useVisionCardCallouts() {
  return useQuery({
    queryKey: ['vision_card_callouts'],
    queryFn: () =>
      directus.request(
        readItems('contents', {
          filter: { type: { _eq: 'vision_card_callout' } },
          sort: ['order_value'],
        }),
      ),
  })
}

export function useUpdateVisionCardCallout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision_card_callouts'] })
    },
  })
}

export function useAddVisionCardCallout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ContentItem, 'id'>) =>
      directus.request(createItem('contents', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision_card_callouts'] })
    },
  })
}
