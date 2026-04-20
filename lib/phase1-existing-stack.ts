import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class Phase1ExistingStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create VPC
        const vpc = new ec2.Vpc(this, 'MyVpc', { maxAzs: 2 });

        // Create Security Group
        const securityGroup = new ec2.SecurityGroup(this, 'MySecurityGroup', {
            vpc,
            description: 'Allow traffic to ECS service',
            allowAllOutbound: true,
        });

        // Create Network Load Balancer
        const nlb = new elbv2.NetworkLoadBalancer(this, 'MyNLB', {
            vpc,
            internetFacing: true,
        });

        // Create Target Group
        const targetGroup = nlb.addListener('Listener', { port: 80 }).addTargets('ECS', {
            port: 80,
        });

        // Create ECS Cluster
        const cluster = new ecs.Cluster(this, 'MyCluster', { vpc });

        // Create IAM Role for ECS Task
        const taskRole = new iam.Role(this, 'MyTaskRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });

        // Create ECS Task Definition
        const taskDefinition = new ecs.FargateTaskDefinition(this, 'MyTaskDef', {
            taskRole: taskRole,
        });

        // Add container to the Task Definition
        taskDefinition.addContainer('MyContainer', {
            image: ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
            memoryLimitMiB: 512,
            portMappings: [{ containerPort: 80 }],
        });

        // Create ECS Service
        new ecs.FargateService(this, 'MyFargateService', {
            cluster,
            taskDefinition,
            desiredCount: 1,
            securityGroup,
            loadBalancers: [{ targetGroupArn: targetGroup.targetGroupArn }],
        });
    }
}