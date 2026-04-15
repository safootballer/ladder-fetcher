import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'SAFie Leagues',
  description: 'SA Footballer League Ladders',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
