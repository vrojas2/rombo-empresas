#!/bin/bash

export STAGE=uat
export IDENTITY_POOL_ID="us-east-1:a5924468-9589-47ec-8b2f-7f2e91556940"
export REGION="us-east-1"
export USER_POOL_ID="us-east-1_CBgvgAy73"
export USER_POOL_CLIENT_ID=t7togq17omc8suqcmbs0qcc2u
export BASE_URL=uat.rombo.microsipnube.com
export UI_MESSAGING_LOGIN_ENDPOINT="https://ui-messaging-control.uat.rombo.microsipnube.com/login"
export CFDI_SERVICE_URL="https://cfdi.uat.rombo.microsipnube.com"

export ZONE_ID=Z0386712K3V8N1VUSI81
export CERTIFICATE_ARN=arn:aws:acm:us-east-1:711179720646:certificate/0b649b51-c423-41b5-99e4-e1df0de6fa47

cdk deploy
