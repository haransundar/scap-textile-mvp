# Create required directories
$directories = @(
    "frontend/public/branding/logos",
    "frontend/public/branding/mascot",
    "frontend/public/branding/favicons",
    "frontend/public/branding/social"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# Copy images to their respective directories
$filesToCopy = @{
    "images/scap-logo-horizontal.png" = "frontend/public/branding/logos/scap-logo-horizontal.png"
    "images/scap-icon.png" = "frontend/public/branding/favicons/scap-icon.png"
    "images/favicon.png" = "frontend/public/favicon.ico"
    "images/linky-avatar.png" = "frontend/public/branding/mascot/linky-avatar.png"
    "images/linky-full.png" = "frontend/public/branding/mascot/linky-full.png"
    "images/og-image.png" = "frontend/public/branding/social/og-image.png"
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
if (-not (Test-Path "frontend/public/favicon.ico")) {
    if (Test-Path "images/scap-icon.png") {
        Copy-Item -Path "images/scap-icon.png" -Destination "frontend/public/favicon.ico" -Force
        Write-Host "Created favicon.ico from scap-icon.png"
    } else {
        Write-Warning "scap-icon.png not found, could not create favicon.ico"
    }
}

Write-Host "\nBrand assets have been organized successfully!" -ForegroundColor Green
