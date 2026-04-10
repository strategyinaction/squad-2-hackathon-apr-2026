import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createItem, deleteItem, readItems, updateItem } from '@directus/sdk'
import { directus, type ContentItem } from '#/lib/directus'

export function useCoreFunctions() {
  return useQuery({
    queryKey: ['core_functions'],
    queryFn: () =>
      directus.request(
        readItems('contents', {
          filter: { type: { _eq: 'core_function' } },
          sort: ['order_value'],
        }),
      ),
  })
}

export function useUpdateCoreFunction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core_functions'] })
    },
  })
}

export function useAddCoreFunction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ContentItem, 'id'>) =>
      directus.request(createItem('contents', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core_functions'] })
    },
  })
}

export function useDeleteCoreFunction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => directus.request(deleteItem('contents', id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core_functions'] })
    },
  })
}
