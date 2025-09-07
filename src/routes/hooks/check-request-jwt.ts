import type { FastifyRequest, FastifyReply } from"fastify"
import jwt from "jsonwebtoken"

type JwtPayload = {
    sub: string
    role: 'admin' | 'manager' | 'supervisor' | 'analyst'
}

export async function checkRequestJwt(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization

    if (!token) {
        return reply.status(401).send()
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined')
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload

        request.user = payload
    } catch {
        return reply.status(401).send()
    }
}