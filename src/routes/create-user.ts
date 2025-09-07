import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../database/client.ts'
import { users } from '../database/schema.ts'
import { hash } from 'argon2'
import z from 'zod'
import { checkRequestJwt } from './hooks/check-request-jwt.ts'
import { checkUserRole } from './hooks/check-user-role.ts'

export const createUserRoute: FastifyPluginAsyncZod = async (server) => {
  server.post('/users', {
    preHandler: [
      checkRequestJwt,
      checkUserRole(['admin', 'manager', 'supervisor', 'analyst']), // Todos passam pela checagem de role
    ],
    schema: {
      tags: ['users'],
      summary: 'Create a user',
      description: 'Essa rota cria um novo usuário na tabela users',
      body: z.object({
        name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres.'),
        email: z.string().email('E-mail inválido.'),
        password: z.string().min(8, 'Senha precisa ter pelo menos 8 caracteres.'),
        role: z.enum(['admin', 'manager', 'supervisor', 'analyst']).default('analyst'),
      }),
      response: {
        201: z.object({ userId: z.string().uuid() }).describe('Usuário criado com sucesso!'),
        400: z.object({ message: z.string() }).describe('Role não encontrada, considere as seguintes opções: admin, manager, supervisor ou analyst.'),
        403: z.object({ message: z.string() }).describe('Sem permissão para criar esse tipo de usuário.'),
      }
    },
  }, async (request, reply) => {
    const { name, email, password, role } = request.body
    const userRole = request.user?.role // Pegamos o papel do usuário autenticado

    // Define quem pode criar quem
    const rolePermissions: Record<string, string[]> = {
      admin: ['admin', 'manager', 'supervisor', 'analyst'],
      manager: ['supervisor', 'analyst'],
      supervisor: ['analyst'],
      analyst: [], // Analyst não pode criar ninguém
    }

    // Verifica se o usuário logado tem permissão para criar o papel solicitado
    const allowedRoles = rolePermissions[userRole as string] || []
    if (!allowedRoles.includes(role)) {
      return reply.status(403).send({
        message: `Usuário com papel '${userRole}' não tem permissão para criar usuários com papel '${role}'.`
      })
    }

    const hashedPassword = await hash(password)

    const result = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning()

    return reply.status(201).send({ userId: result[0].id })
  })
}
