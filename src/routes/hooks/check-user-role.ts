import type { FastifyRequest, FastifyReply } from 'fastify'
import { getAuthenticatedUserFromRequest } from '../../utils/get-authenticated-user-from-request.ts'

export function checkUserRole(roles: Array<'admin' | 'manager' | 'supervisor' | 'analyst'>) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = getAuthenticatedUserFromRequest(request)

    if (!roles.includes(user.role)) {
      return reply.status(403).send({
        message: `Acesso negado: papel '${user.role}' não tem permissão.`,
      })
    }
  }
}
