#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Phase1Stack } from '../lib/phase1-stack'; // Adjust the import based on your structure
import { Phase2Stack } from '../lib/phase2-stack'; // Adjust the import based on your structure

const app = new cdk.App();

// Retrieve context from cdk.json
const phase1Context = app.node.tryGetContext('phase1');
const phase2Context = app.node.tryGetContext('phase2');

// Instantiate both Phase 1 and Phase 2 stacks
new Phase1Stack(app, 'Phase1Stack', {
  // pass in phase1Context to the stack if needed
  ...phase1Context,
});

new Phase2Stack(app, 'Phase2Stack', {
  // pass in phase2Context to the stack if needed
  ...phase2Context,
});

app.synth();
