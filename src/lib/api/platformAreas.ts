export function usePlatformAreas() {
  return useQuery({
    queryKey: ['platform_areas'],
    queryFn: () =>
      directus.request(
        readItems('contents', {
          filter: { type: { _eq: 'platform_area' } },
          sort: ['order_value'],
        }),
      ),
  })
}

export function useUpdatePlatformArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ContentItem, 'id' | 'type'>> }) =>
      directus.request(updateItem('contents', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform_areas'] })
    },
  })
}
