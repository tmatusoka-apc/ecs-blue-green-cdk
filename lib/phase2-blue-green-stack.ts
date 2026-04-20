import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { NetworkLoadBalancer, NetworkTargetGroup, ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Cluster, FargateService, TaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Role, ServicePrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class Phase2BlueGreenStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create VPC
        const vpc = new Vpc(this, 'Phase2VPC', { maxAzs: 2 });

        // Create Network Load Balancer
        const nlb = new NetworkLoadBalancer(this, 'Phase2NLB', { vpc, internetFacing: true });

        // Create Target Groups
        const blueTargetGroup = new NetworkTargetGroup(this, 'BlueTargetGroup', { vpc, port: 80 });
        const greenTargetGroup = new NetworkTargetGroup(this, 'GreenTargetGroup', { vpc, port: 80 });

        // Add target groups to NLB
        nlb.addListener('Listener', { port: 80, defaultAction: ListenerAction.forward([blueTargetGroup]) });

        // ECS Cluster
        const cluster = new Cluster(this, 'Phase2Cluster', { vpc });

        // Create Fargate Task Definition
        const taskDef = new TaskDefinition(this, 'Phase2TaskDef', { compatibility: 'FARGATE' });
        // Add containers as needed (omitted for brevity)

        // Create Fargate Service
        const fargateService = new FargateService(this, 'Phase2FargateService', {
            cluster,
            taskDefinition,
            desiredCount: 2,
        });

        // Create Lambda Function for Switching
        const switchLambda = new Function(this, 'SwitchLambda', {
            runtime: Runtime.NODEJS_14_X,
            code: Code.fromAsset('lambda'),
            handler: 'switch.handler',
        });

        // Create S3 Bucket for Artifacts
        const artifactBucket = new Bucket(this, 'Phase2ArtifactBucket');

        // Create IAM Roles
        const ecsRole = new Role(this, 'EcsTaskRole', { assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com') });
        ecsRole.addToPolicy(new PolicyStatement({ actions: ['s3:GetObject'], resources: [artifactBucket.bucketArn] }));

        // Add permissions for Lambda
        const lambdaExecutionRole = new Role(this, 'LambdaExecutionRole', { assumedBy: new ServicePrincipal('lambda.amazonaws.com') });
        lambdaExecutionRole.addToPolicy(new PolicyStatement({ actions: ['elasticloadbalancing:ModifyTargetGroup', 'lambda:InvokeFunction'], resources: ['*'] }));
    }
}
