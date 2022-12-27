import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { CfnIdentityPool, CfnIdentityPoolRoleAttachment, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Effect, FederatedPrincipal, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';


export class AuthStack extends cdk.Stack {
  public readonly userPool: UserPool;
  public readonly identityPool: CfnIdentityPool;
  public readonly userPoolClient: UserPoolClient

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = this.createUserPool();

    this.userPoolClient = this.createUserPoolClient(this.userPool);

    this.identityPool = this.createIdentityPool(this.userPoolClient, this.userPool);

    const userPoolDomain = this.createUserPoolDomain(this.userPool)

    const { authenticatedRole, unauthenticatedRole } = this.initializeRoles(
      this.identityPool
    );

    this.attachRoles(
      this.userPool,
      this.userPoolClient,
      this.identityPool,
      authenticatedRole,
      unauthenticatedRole
    );

    new CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
    })

    new CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
    })

    new CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref,
    })

    new CfnOutput(this, 'UserPoolDomainDomain', {
      value: userPoolDomain.domain
    })
  }

  private createUserPoolDomain(userPool: UserPool) {
    return new cognito.CfnUserPoolDomain(this, 'UserPoolDomain', {
      userPoolId: userPool.userPoolId,
      domain: 'gh10290'
    });
  }

  private createIdentityPool(userPoolClient: UserPoolClient, userPool: UserPool) {
    return new cognito.CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [{
        clientId: userPoolClient.userPoolClientId,
        providerName: userPool.userPoolProviderName
      }],
    });
  }

  private createUserPoolClient(userPool: UserPool) {
    return new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      oAuth: {
        flows: {
          authorizationCodeGrant: true
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
        callbackUrls: [
          'http://localhost:3000/',
          'http://localhost:3000/auth-callback',
        ],
        logoutUrls: [
          'http://localhost:3000/',
        ],
      }
    });
  }

  private createUserPool() {
    return new cognito.UserPool(this, 'UserPool', {
      signInAliases: {
        email: true
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      },
      selfSignUpEnabled: true,
      autoVerify: {
        email: true
      }
    });
  }

  private initializeRoles(identityPool: CfnIdentityPool) {
    const authenticatedRole = new Role(
      this,
      "CognitoDefaultAuthenticatedRole",
      {
        assumedBy: new FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );

    authenticatedRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "mobileanalytics:PutEvents",
          "cognito-sync:*",
          "cognito-identity:*",
        ],
        resources: ["*"],
      })
    );

    // https://youtu.be/tKj9J-F0GK8?t=2019
    const unauthenticatedRole = new Role(
      this,
      "CognitoDefaultUnauthenticatedRole",
      {
        assumedBy: new FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "unauthenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );

    const adminRole = new Role(this, "CognitoAdminRole", {
      assumedBy: new FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
    });

    return { authenticatedRole, unauthenticatedRole, adminRole };
  }

  private attachRoles(
    userPool: UserPool,
    userPoolClient: UserPoolClient,
    identityPool: CfnIdentityPool,
    authenticatedRole: Role,
    unauthenticatedRole: Role
  ) {
    new CfnIdentityPoolRoleAttachment(this, "RolesAttachment", {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
        unauthenticated: unauthenticatedRole.roleArn,
      },
      roleMappings: {
        adminMapping: {
          type: "Token",
          ambiguousRoleResolution: "AuthenticatedRole",
          identityProvider: `${userPool.userPoolProviderName}:${userPoolClient.userPoolClientId}`,
        },
      },
    });
  }
}
