import { test, expect } from 'vitest'
import request from 'supertest'
import { server } from '../app.ts'
import { faker } from '@faker-js/faker'
import { makeCourse } from '../tests/factories/make-course.ts'
import { makeAuthenticatedUser } from '../tests/factories/make-user.ts'

test('get course by ID', async () => {
  await server.ready()
  
  const { token } = await makeAuthenticatedUser('student')
  const course = await makeCourse()

  const response = await request(server.server)
  .get(`/courses/${course.id}`)
  .set('Authorization', token)

  expect(response.status).toEqual(200)
  expect(response.body).toEqual({
    course: {
      id: expect.any(String),
      title: expect.any(String),
      description: null,
    }
  })
})

test('return 404 for no existing courses', async () => {
  await server.ready()
  
  const { token } = await makeAuthenticatedUser('student')


  const response = await request(server.server)
    .get(`/courses/f3a9c7e2-8b4d-4c1a-9d2e-6f1b3a2c9e4f`)
    .set('Authorization', token)

  expect(response.status).toEqual(404)
})