import { server } from './app.ts'

server.listen({ port: 3333 }).then(() => {
  console.log("Ta rodando!")
})
