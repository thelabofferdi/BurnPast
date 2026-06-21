export default defineEventHandler((event) => {
  setNoStoreHeaders(event)

  return {
    ok: true,
    service: 'burnpast',
    time: new Date().toISOString()
  }
})
