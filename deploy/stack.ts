import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { HostedZone } from 'aws-cdk-lib/aws-route53'
import { NextJSLambdaEdge } from '@sls-next/cdk-construct'

interface Props extends StackProps {
  stage: string
  removalPolicy: RemovalPolicy
}

export class NextStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const { stage, removalPolicy } = props
    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      process.env.CERTIFICATE_ARN,
    )

    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: `${stage}.rombo.microsipnube.com`,
    })

    const webapp = new NextJSLambdaEdge(this, 'WebApp', {
      serverlessBuildOutDir: './build',
      cachePolicyName: {
        staticsCache: `EmpresaStaticsCache-${stage}`,
        imageCache: `EmpresasImageCache-${stage}`,
        lambdaCache: `EmpresasLambdaCache-${stage}`,
      },
      description: `${id} : Functions Lambda@Edge for the application`,
      memory: 1024,
      name: {
        imageLambda: `EmpresasImageLambda-${stage}`,
        defaultLambda: `EmpresasDefaultLambda-${stage}`,
        apiLambda: `EmpresasApiLambda-${stage}`,
      },
      runtime: Runtime.NODEJS_14_X,
      withLogging: true,
      s3Props: {
        bucketName: `empresas-webapp-${stage}`,
        removalPolicy,
      },
      domain: {
        certificate,
        domainNames: [`${stage}.rombo.microsipnube.com`],
        hostedZone,
      },
      cloudfrontProps: {
        comment: `${id}`,
      },
    })

    new CfnOutput(this, 'CloudFormationDistributionDomain', {
      value: webapp.distribution.domainName,
    })

    new CfnOutput(this, 'Domain', {
      value: webapp.aRecord.domainName,
    })
  }
}
