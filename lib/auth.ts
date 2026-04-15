import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createHash } from 'crypto'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        const passwordHash = createHash('sha256').update(credentials.password as string).digest('hex')
        const { prisma } = await import('@/lib/prisma')
        const user = await prisma.user.findFirst({
          where: { username: credentials.username as string, password_hash: passwordHash },
        })
        if (!user) return null
        await prisma.user.update({ where: { id: user.id }, data: { last_login: new Date().toISOString() } })
        return { id: String(user.id), name: user.username, email: user.username, role: user.role } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = (user as any).id; token.role = (user as any).role }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id   = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
