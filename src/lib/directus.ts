import { createDirectus, rest, staticToken } from '@directus/sdk'

// BE field names: title = FE label/eyebrow, subtitle = FE title, description = FE subtitle/description
export interface ContentItem {
  id: number
  type: string
  title: string | null
  subtitle: string | null
  description: string | null
  order_value: number | null
  parent_id: number | null
}

interface DirectusSchema {
  contents: ContentItem[]
}

export const directus = createDirectus<DirectusSchema>(
  import.meta.env.VITE_BASE_API_URL as string,
)
  .with(staticToken(import.meta.env.VITE_API_AUTH_TOKEN as string))
  .with(rest())
