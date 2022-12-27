#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../src/infra/app-stack';
import { AuthStack } from '../src/infra/auth-stack';

const app = new cdk.App();

const auth = new AuthStack(app, 'gh10290-auth', {});

new AppStack(app, 'gh10290-app', {
	userPool: auth.userPool,
	identityPool: auth.identityPool,
	userPoolClient: auth.userPoolClient,
});