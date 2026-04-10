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

export interface CommentItem {
  id: number
  content_id: number
  author: string
  type: 'idea' | 'feedback' | 'challenge' | 'question'
  text: string
  date_created: string
}

interface DirectusSchema {
  contents: ContentItem[]
  comments: CommentItem[]
}

export const directus = createDirectus<DirectusSchema>(
  import.meta.env.VITE_BASE_API_URL as string,
)
  .with(staticToken(import.meta.env.VITE_API_AUTH_TOKEN as string))
  .with(rest())
