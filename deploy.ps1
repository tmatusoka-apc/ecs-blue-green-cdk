# Deploy Phase 1
Write-Host "Deploying Phase 1 Stack..."
aws cloudformation create-stack `
  --stack-name phase1-stack `
  --template-body file://templates/phase1-template.yaml `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-northeast-1

# Wait for Phase 1 completion
aws cloudformation wait stack-create-complete `
  --stack-name phase1-stack `
  --region ap-northeast-1

Write-Host "Phase 1 Stack Created Successfully!"

# Deploy Phase 2
Write-Host "Deploying Phase 2 Stack..."
aws cloudformation create-stack `
  --stack-name phase2-stack `
  --template-body file://templates/phase2-template.yaml `
  --parameters ParameterKey=Phase1StackName,ParameterValue=phase1-stack `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-northeast-1

aws cloudformation wait stack-create-complete `
  --stack-name phase2-stack `
  --region ap-northeast-1

Write-Host "Phase 2 Stack Created Successfully!"

# Display outputs
Write-Host "`nPhase 1 Outputs:"
aws cloudformation describe-stacks `
  --stack-name phase1-stack `
  --query "Stacks[0].Outputs" `
  --region ap-northeast-1

Write-Host "`nPhase 2 Outputs:"
aws cloudformation describe-stacks `
  --stack-name phase2-stack `
  --query "Stacks[0].Outputs" `
  --region ap-northeast-1