import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { width?: number; height?: number }

export function Vision({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="m8.7 12.925 1.375.925L12 12.875l1.925.975 1.325-.875-1-1.975h-4.6zM5.225 20H18.75l-2.6-5.225-2.075 1.375L12 15.125 9.925 16.15 7.8 14.75zM2 22l5.85-11.875q.25-.5.738-.812A1.93 1.93 0 0 1 9.65 9H11V2h7l-1 2 1 2h-5v3h1.25q.575 0 1.05.3t.75.8L22 22z" />
    </svg>
  )
}

export function Target({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width={width} height={height} fill="currentColor" {...props}>
      <path d="M10.231 2.574a6 6 0 1 0 2.871 2.882 1.5 1.5 0 0 0 1.268-.425l.13-.13c.428.945.667 1.994.667 3.099a7.5 7.5 0 1 1-4.372-6.819l-.137.137a1.5 1.5 0 0 0-.427 1.256" />
      <path d="M11.728 6.06a4.5 4.5 0 1 1-2.121-2.121L8.444 5.102A3.004 3.004 0 0 0 4.667 8a3 3 0 1 0 5.898-.777z" />
      <path d="M9.167 8a1.5 1.5 0 1 1-.883-1.367l3.205-3.205-.142-.996a.38.38 0 0 1 .106-.318L12.912.655a.375.375 0 0 1 .636.212l.16 1.114 1.113.16c.306.043.43.417.212.636l-1.458 1.458a.38.38 0 0 1-.319.106l-.953-.136-3.241 3.241q.104.259.105.554" />
    </svg>
  )
}

export function Lan({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M13 22h8v-7h-3v-4h-5V9h3V2H8v7h3v2H6v4H3v7h8v-7H8v-2h8v2h-3zM10 7V4h4v3zM9 17v3H5v-3zm10 0v3h-4v-3z" />
    </svg>
  )
}

export function School({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9zm6.82 6L12 12.72 5.18 9 12 5.28zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73z" />
    </svg>
  )
}

export function ArrowForward({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  )
}

export function ArrowBack({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
    </svg>
  )
}

export function Lightbulb({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7m2.85 11.1-.85.6V16h-4v-2.3l-.85-.6A5 5 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1" />
    </svg>
  )
}

export function ThumbUp({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M9 22h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.58 8.59C7.22 8.95 7 9.45 7 10v10c0 1.1.9 2 2 2m0-12 4.34-4.34L12 11h9v2l-3 7H9zm-8 0h4v12H1z" />
    </svg>
  )
}

export function ModeComment({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M20 17.17 18.83 16H4V4h16zM20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2" />
    </svg>
  )
}

export function TrendingUp({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
    </svg>
  )
}

export function Groups({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29M20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24zm-7.76-2.78c-1.17-.52-2.61-.9-4.24-.9s-3.07.39-4.24.9A2.99 2.99 0 0 0 6 16.39V18h12v-1.61c0-1.18-.68-2.26-1.76-2.74M8.07 16c.09-.23.13-.39.91-.69a8.3 8.3 0 0 1 3.02-.56c1.03 0 2.05.18 3.02.56.77.3.81.46.91.69zM12 8c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m0-2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3" />
    </svg>
  )
}

export function ChevronRight({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="m9.705 6-1.41 1.41 4.58 4.59-4.58 4.59L9.705 18l6-6z" />
    </svg>
  )
}

export function EmojiObjects({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M12.002 2.5c-.46 0-.93.04-1.4.14-2.76.53-4.96 2.76-5.48 5.52-.48 2.61.48 5.01 2.22 6.56.43.38.66.91.66 1.47v2.31c0 1.1.9 2 2 2h.28a1.98 1.98 0 0 0 3.44 0h.28c1.1 0 2-.9 2-2v-2.31c0-.55.22-1.09.64-1.46a6.96 6.96 0 0 0 2.36-5.23c0-3.87-3.13-7-7-7m2 14h-4v-1h4zm-4 2v-1h4v1zm5.31-5.26c-.09.08-.16.18-.24.26h-6.15c-.08-.09-.15-.19-.24-.27-1.32-1.18-1.91-2.94-1.59-4.7.36-1.94 1.96-3.55 3.89-3.93.34-.07.68-.1 1.02-.1 2.76 0 5 2.24 5 5 0 1.43-.61 2.79-1.69 3.74" />
      <path d="M12.502 10.5h-1v3h1z" />
      <path d="m10.381 8.374-.707.707 2.121 2.121.707-.707z" />
      <path d="m11.503 10.505.707.707 2.12-2.121-.706-.707z" />
    </svg>
  )
}

export function Add({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
    </svg>
  )
}

export function Flag({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="m11.86 5.5.4 2h5.24v6h-3.36l-.4-2H6.5v-6zm1.64-2h-9v17h2v-7h5.6l.4 2h7v-10h-5.6z" />
    </svg>
  )
}

export function QuestionMark({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M11.069 12.35c.77-1.39 2.25-2.21 3.11-3.44.91-1.29.4-3.7-2.18-3.7-1.69 0-2.52 1.28-2.87 2.34l-2.59-1.09c.71-2.13 2.64-3.96 5.45-3.96 2.35 0 3.96 1.07 4.78 2.41.7 1.15 1.11 3.3.03 4.9-1.2 1.77-2.35 2.31-2.97 3.45-.25.46-.35.76-.35 2.24h-2.89c-.01-.78-.13-2.05.48-3.15m2.93 7.15c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2" />
    </svg>
  )
}

export function CheckCircle({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
    </svg>
  )
}

export function Close({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}
