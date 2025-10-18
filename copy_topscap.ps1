# Ensure the public directory exists
$publicDir = "frontend\public"
if (-not (Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir | Out-Null
}

# Copy topscap.png to the public directory
if (Test-Path "images\topscap.png") {
    Copy-Item -Path "images\topscap.png" -Destination "$publicDir\topscap.png" -Force
    Write-Host "Copied topscap.png to $publicDir\topscap.png"
} else {
    Write-Warning "topscap.png not found in the images directory"
}
