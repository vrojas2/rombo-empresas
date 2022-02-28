import { App, RemovalPolicy } from 'aws-cdk-lib'
import { Builder } from '@sls-next/lambda-at-edge'
import { config } from 'dotenv'
config()
import { NextStack } from './stack'

const stage = process.env.STAGE || 'dev'
const region = 'us-east-1'
const account = process.env.ACCOUNT || '711179720646'
const removalPolicy = stage === 'production' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY
const builder = new Builder('.', './build', { args: ['build'] })

builder
  .build()
  .then(() => {
    const app = new App()
    new NextStack(app, `EmpresasWebApp-${stage}`, {
      analyticsReporting: true,
      description: 'EmpresasWebApp description @' + stage,
      env: { region, account },
      stage,
      removalPolicy,
    })
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
