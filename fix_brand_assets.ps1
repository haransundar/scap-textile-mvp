# Ensure the public directory exists
$publicDir = "frontend\public"
if (-not (Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir | Out-Null
}

# Create branding directories
$brandingDirs = @(
    "$publicDir\branding\logos",
    "$publicDir\branding\mascot",
    "$publicDir\branding\favicons",
    "$publicDir\branding\social"
)

foreach ($dir in $brandingDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# Copy images to their respective directories
$filesToCopy = @{
    "images\scap-logo-horizontal.png" = "$publicDir\branding\logos\scap-logo-horizontal.png"
    "images\scap-icon.png" = "$publicDir\branding\favicons\scap-icon.png"
    "images\favicon.png" = "$publicDir\favicon.ico"
    "images\linky-avatar.png" = "$publicDir\branding\mascot\linky-avatar.png"
    "images\linky-full.png" = "$publicDir\branding\mascot\linky-full.png"
    "images\og-image.png" = "$publicDir\branding\social\og-image.png"
}

foreach ($file in $filesToCopy.GetEnumerator()) {
    $source = $file.Key
    $destination = $file.Value
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $destination -Force
        Write-Host "Copied $source to $destination"
    } else {
        Write-Warning "Source file not found: $source"
    }
}

# Create favicon.ico if it doesn't exist
if (-not (Test-Path "$publicDir\favicon.ico") -and (Test-Path "images\scap-icon.png")) {
    Copy-Item -Path "images\scap-icon.png" -Destination "$publicDir\favicon.ico" -Force
    Write-Host "Created favicon.ico from scap-icon.png"
}

Write-Host "`nBrand assets have been verified and fixed!" -ForegroundColor Green
