import Amplify from 'aws-amplify'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

Amplify.configure({
  Auth: {
    identityPoolId: publicRuntimeConfig.identityPoolId,
    region: publicRuntimeConfig.awsRegion,
    identityPoolRegion: publicRuntimeConfig.awsRegion,
    userPoolId: publicRuntimeConfig.userPoolId,
    userPoolWebClientId: publicRuntimeConfig.userPoolIdClient,
  },
})

export default Amplify
