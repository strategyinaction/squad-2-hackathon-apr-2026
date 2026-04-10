import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createItem, readItems, updateItem } from '@directus/sdk'
import { directus, type ContentItem } from '#/lib/directus'

export function usePersonas(prefix = '') {
  const type = prefix ? `${prefix}_persona` : 'persona'
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

export function usePersonaJTBDs(prefix = '') {
  const type = prefix ? `${prefix}_persona_jtbd` : 'persona_jtbd'
  return useQuery({
    queryKey: [type],
    queryFn: () =>
      directus.request(
        readItems('contents', {
          filter: { type: { _eq: type } },
          sort: ['parent_id', 'order_value'],
        }),
      ),
  })
}

export function useUpdatePersona(prefix = '') {
  const type = prefix ? `${prefix}_persona` : 'persona'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

export function useAddPersona(prefix = '') {
  const type = prefix ? `${prefix}_persona` : 'persona'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ContentItem, 'id'>) =>
      directus.request(createItem('contents', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

export function useUpdatePersonaJTBD(prefix = '') {
  const type = prefix ? `${prefix}_persona_jtbd` : 'persona_jtbd'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}

export function useAddPersonaJTBD(prefix = '') {
  const type = prefix ? `${prefix}_persona_jtbd` : 'persona_jtbd'
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ContentItem, 'id'>) =>
      directus.request(createItem('contents', data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
    },
  })
}
