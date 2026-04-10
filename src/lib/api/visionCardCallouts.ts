import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createItem, readItems, updateItem } from '@directus/sdk'
import { directus, type ContentItem } from '#/lib/directus'

export function useVisionCardCallouts(prefix = '') {
  const type = prefix ? `${prefix}_vision_card_callout` : 'vision_card_callout'
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

export function useUpdateVisionCardCallout(prefix = '') {
  const type = prefix ? `${prefix}_vision_card_callout` : 'vision_card_callout'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

export function useAddVisionCardCallout(prefix = '') {
  const type = prefix ? `${prefix}_vision_card_callout` : 'vision_card_callout'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ContentItem, 'id'>) =>
      directus.request(createItem('contents', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}
