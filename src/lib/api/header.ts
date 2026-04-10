import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { readItems, updateItem } from '@directus/sdk'
import { directus, type ContentItem } from '#/lib/directus'

export function useHeader() {
  return useQuery({
    queryKey: ['header'],
    queryFn: async () => {
      const items = await directus.request(
        readItems('contents', { filter: { type: { _eq: 'header' } }, limit: 1 }),
      )
      return items[0] ?? null
    },
  })
}

export function useUpdateHeader() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header'] })
    },
  })
}
