// Service Worker更新策略
// 每次打开网页浏览器都会在后台重新下载Service Worker
// 即使下载的Service Worker文件与当前只有一字节差别
// 浏览器也会认为这是新的并重新注册

// Service Worker 生命周期
// 1. 用户载入一个URL
// 2. 在注册(Register)过程中,浏览器下载,解析,执行Service Worker
// 3. 一旦Service Worker被执行,install事件就会被触发
// 4. 如果装载成功(Actived),Service Worker就可以控制客户端缓存并监听其功能事件

// 缓存名称(标示)
const cacheKey = new Date().toISOString()
// 缓存白名单
const cacheWhitelist = [cacheKey]
// 被缓存的静态资源URL列表
const cacheFileList = [        
  '/css/index.css',
  '/img/background.jpg',
  '/js/test.js'
]

// Service Worker 安装事件
// 在安装过程中缓存我们已知的资源
self.addEventListener('install', function (event) {
  console.log('install事件触发')
  event.waitUntil(
    // 使用指定的缓存名称来打开缓存
    caches.open(cacheKey)
      // 将制定的文件添加到缓存中
      .then(cache => cache.addAll(cacheFileList))
  )
  // 调用这两个函数可以快速激活Service Worker
  self.skipWaiting()
  self.clients.claim()
})

// 添加 fecth 事件的事件监听器
self.addEventListener('fetch', function (event) {  
  console.log('fetch事件触发')
  event.respondWith(
    // 检查传入的URL是否命中缓存
    // 添加参数可以忽略查询字符串
    // caches.match(event.request, { ignoreSearch: true })
    caches.match(event.request)                    
      .then(function (response) {
        // 如果命中缓存的资源就将它返回
        if (response) {                            
          return response;                           
        }
        // 未命中缓存的话就通过网络去获取资源
        // 我们克隆了一个请求
        // 原因是请求是一个流，只能消耗一次
        const requestToCache = event.request.clone()
        // 按照正常的方式去请求资源
        return fetch(requestToCache).then(
          function (response) {
            if (!response || response.status !== 200) {
              return response
            }
            // 如果请求成功，则克隆响应，原因同上
            const responseToCache = response.clone()
            caches.open(cacheKey)
              .then(function (cache) {
                // 将完整的请求添加到缓存中
                cache.put(requestToCache, responseToCache)
              })
            return response
          }
        )           
      })
  )
})

// 监听新的Service Worker注册后触发的active事件
self.addEventListener('activate', function (event) {
  console.log('active事件触发')
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          // 不存在白名单的缓存全部清除掉
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})