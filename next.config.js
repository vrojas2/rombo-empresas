/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config()

module.exports = {
  trailingSlash: true,
  serverRuntimeConfig: {},
  publicRuntimeConfig: {
    identityPoolId: process.env.IDENTITY_POOL_ID,
    awsRegion: process.env.REGION,
    userPoolId: process.env.USER_POOL_ID,
    userPoolIdClient: process.env.USER_POOL_CLIENT_ID,
    baseUrl: process.env.BASE_URL,
    maxDirections: process.env.MAX_DIRECTIONS || 3,
    uiMessagingEndpoint: process.env.UI_MESSAGING_ENDPOINT,
    uiMessagingLoginEndpoint: process.env.UI_MESSAGING_LOGIN_ENDPOINT,
    cookiesSecure: process.env.COOKIES_SECURE || false,
    jwtDefaultExpiration: process.env.JWT_DEFAULT_EXPIRATION || 3000000,
    maxItemsVariants: process.env.MAX_ITEM_VARIANTS || 3,
    bcryptSalts: process.env.BCRYPT_SALTS || 10,
    contactEmail: process.env.CONTACT_EMAIL,
    cfdiResource:
      process.env.CFDI_SERVICE_URL || 'https://g160zoq7r1.execute-api.us-west-2.amazonaws.com/dev/',
    stripeKey: process.env.STRIPE_PUBLIC_KEY,
  },
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 30 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  async redirects() {
    return []
  },
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    return {
      '/': { page: '/' },
      '/articulos': { page: '/articulos' },
      '/articulos/nuevo': { page: '/articulos/nuevo' },
      '/clientes': { page: '/clientes' },
      '/clientes/nuevo': { page: '/clientes/nuevo' },
      '/facturas': { page: '/facturas' },
      '/facturas/nuevo': { page: '/facturas/nuevo' },
      '/public/registro': { page: '/public/registro' },
    }
  },
}
