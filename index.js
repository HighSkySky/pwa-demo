const Koa = require('koa')
const static = require('koa-static')

const app = new Koa()

app.use(static('./public'))

app.use(async ctx => {
  ctx.body = {
    success: true,
    data: 'hello pwa'
  }
})

app.listen(8080, () => {
  console.log('server is starting at localhost:8080')
})