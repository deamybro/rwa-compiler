param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("testnet", "mainnet")]
  [string]$Network
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

if ($Network -eq "mainnet") {
  $testnetRecord = Get-Content -LiteralPath "deployments\xlayer-testnet.json" -Raw | ConvertFrom-Json
  if ($testnetRecord.status -ne "DEPLOYED_AND_SMOKE_TESTED") {
    throw "Mainnet is gated: testnet must be DEPLOYED_AND_SMOKE_TESTED first."
  }
}

$chainId = if ($Network -eq "testnet") { 1952 } else { 196 }
$confirmationPhrase = "DEPLOY X LAYER $($Network.ToUpperInvariant())"
$checkScript = "deploy:check:$Network"
$deployScript = "deploy:$Network"
$smokeScript = "smoke:$Network"

npm run $checkScript
if ($LASTEXITCODE -ne 0) { throw "RPC and bytecode preflight failed." }

Write-Host ""
Write-Host "Prepared action: deploy RWARegistry, PolicyEngine, and GuardedExecutor to X Layer $Network (chain $chainId)."
Write-Host "The lifecycle smoke test will register NVDAx, anchor the live Passport hash, prove ALLOW, simulate a PAUSE revert, and resume ALLOW."
Write-Host "No swaps, token purchases, approvals, or trading-volume transactions are performed."
$confirmation = Read-Host "Type '$confirmationPhrase' to continue"
if ($confirmation -cne $confirmationPhrase) {
  Write-Host "Cancelled without broadcasting."
  exit 1
}

$secureKey = Read-Host "Enter the 0x-prefixed deployer private key (input is hidden)" -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)

try {
  $env:DEPLOYER_PRIVATE_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
  $env:GIT_COMMIT = (git rev-parse HEAD).Trim()
  $env:NEXT_PUBLIC_APP_URL = "https://rwa-compiler.meboebube48.chatgpt.site"

  npm run $deployScript
  if ($LASTEXITCODE -ne 0) { throw "Contract deployment failed. Review the RPC error; do not continue to smoke testing." }

  npm run $smokeScript
  if ($LASTEXITCODE -ne 0) { throw "Deployment succeeded, but lifecycle smoke testing failed. Do not proceed to the next network." }

  Write-Host "Deployment and lifecycle smoke testing completed. Review deployments\xlayer-$Network.json and every explorer link before proceeding."
}
finally {
  Remove-Item Env:DEPLOYER_PRIVATE_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:GIT_COMMIT -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  $secureKey.Dispose()
}
