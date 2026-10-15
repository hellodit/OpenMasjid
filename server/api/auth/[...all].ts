export default defineEventHandler((event) => auth.handler(toWebRequest(event)))
