import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { readItems, createItem } from '@directus/sdk'
import { directus } from '#/lib/directus'

export function useComments() {
  return useQuery({
    queryKey: ['comments'],
    queryFn: () =>
      directus.request(
        readItems('comments', {
          sort: ['-date_created'],
          limit: -1,
        }),
      ),
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { content_id: number; author: string; type: 'idea' | 'feedback' | 'challenge' | 'question'; text: string }) =>
      directus.request(createItem('comments', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}
