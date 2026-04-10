import { useQuery } from '@tanstack/react-query'
import { readItems } from '@directus/sdk'
import { directus } from '#/lib/directus'

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
