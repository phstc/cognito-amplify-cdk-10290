import {
  App,
  GitHubSourceCodeProvider,
  RedirectStatus
} from '@aws-cdk/aws-amplify-alpha';
import * as cdk from 'aws-cdk-lib';
import { CfnOutput, Duration, SecretValue } from 'aws-cdk-lib';
import { AuthorizationType, CfnAuthorizer, Cors, LambdaIntegration, MethodOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { CfnIdentityPool, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import path = require('path');

interface AppProps extends cdk.StackProps {
  userPool: UserPool;
  identityPool: CfnIdentityPool;
  userPoolClient: UserPoolClient
}


export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppProps) {
    super(scope, id, props);

    const helloFn = new NodejsFunction(
      this,
      `${id}-fn`,
      {
        timeout: Duration.minutes(5),
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, `../functions/hello.ts`),
      }
    );

    const restApi = new RestApi(this, "api", {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ["*"],
      },
    });

    const restApiAuthorizer = new CfnAuthorizer(
      this,
      "api-authorizer",
      {
        restApiId: restApi.restApiId,
        name: "APIAuthorizer",
        type: AuthorizationType.COGNITO,
        identitySource: "method.request.header.Authorization",
        providerArns: [props.userPool.userPoolArn],
      }
    );

    const root = restApi.root
    const resources = root.addResource("hello");

    const auth: Pick<MethodOptions, 'authorizationType' | 'authorizer'> = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: restApiAuthorizer.ref,
      },
    }

    resources.addMethod("GET", new LambdaIntegration(helloFn), { ...auth });

    this.createAmplify(props.identityPool, props.userPool, props.userPoolClient, restApi);

    new CfnOutput(this, "api-endpoint", {
      value: restApi.url,
    });
  }

  private createAmplify(identityPool: CfnIdentityPool, userPool: UserPool, userPoolClient: UserPoolClient, restApi: RestApi) {
    const role = new iam.Role(this, "amplify-role", {
      assumedBy: new iam.ServicePrincipal("amplify.amazonaws.com"),
    });

    const managedPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      "AdministratorAccess-Amplify"
    );
    role.addManagedPolicy(managedPolicy);

    const app = new App(this, "app", {
      appName: "gh10290",
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: "phstc",
        repository: "cognito-amplify-cdk-10290",
        oauthToken: SecretValue.secretsManager("GITHUB_TOKEN")
      }),
      autoBranchDeletion: true,
      customRules: [
        {
          source: '/<*>',
          target: ' /index.html',
          status: RedirectStatus.NOT_FOUND_REWRITE,
        },
      ],
      environmentVariables:
      {
        "AMPLIFY_MONOREPO_APP_ROOT": "frontend",
        "NEXT_PUBLIC_IDENTITY_POOL_ID": identityPool.ref,
        "NEXT_PUBLIC_REGION": this.region,
        "NEXT_PUBLIC_USER_POOL_ID": userPool.userPoolId,
        "NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID": userPoolClient.userPoolClientId,
        "NEXT_PUBLIC_ENDPOINT": restApi.url,
        "NEXT_PUBLIC_AUTH_URL": "https://localhost:3000",
      },
      buildSpec: this.generateBuildSpec(),
      role,
    });

    app.addBranch("main", { stage: 'PRODUCTION' })
  }

  private generateBuildSpec() {
    const buildSpecObj = {
      version: "1.0",
      applications: [
        {
          appRoot: "frontend",
          frontend: {
            phases: {
              preBuild: {
                commands: ["npm ci"],
              },
              build: {
                commands: [
                  "echo NEXT_PUBLIC_IDENTITY_POOL_ID=$NEXT_PUBLIC_IDENTITY_POOL_ID >> .env_local",
                  "echo NEXT_PUBLIC_USER_POOL_ID=$NEXT_PUBLIC_USER_POOL_ID >> .env_local",
                  "echo NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID=$NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID >> .env_local",
                  "echo NEXT_PUBLIC_REGION=$NEXT_PUBLIC_REGION >> .env_local",
                  "echo NEXT_PUBLIC_AUTH_URL=$NEXT_PUBLIC_AUTH_URL >> .env_local",
                  "npm run build",
                  "npm run export",
                ],
              },
            },
            artifacts: {
              baseDirectory: ".next",
              files: ["**/*"],
            },
            cache: {
              paths: ["node_modules/**/*"],
            },
          },
        },
      ],
    };

    return codebuild.BuildSpec.fromObjectToYaml(buildSpecObj)
  }
}