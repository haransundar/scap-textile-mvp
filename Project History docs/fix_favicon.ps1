# Ensure the public directory exists
$publicDir = "frontend\public"
if (-not (Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir | Out-Null
}

# Copy favicon.png to the root of the public directory
if (Test-Path "images\favicon.png") {
    Copy-Item -Path "images\favicon.png" -Destination "$publicDir\favicon.png" -Force
    Write-Host "Copied favicon.png to $publicDir\favicon.png"
} else {
    Write-Warning "favicon.png not found in the images directory"
}

# Also ensure favicon.ico exists
if (-not (Test-Path "$publicDir\favicon.ico") -and (Test-Path "images\scap-icon.png")) {
    Copy-Item -Path "images\scap-icon.png" -Destination "$publicDir\favicon.ico" -Force
    Write-Host "Created favicon.ico from scap-icon.png"
}

Write-Host "`nFavicon has been updated!" -ForegroundColor Green
