# Create directories
$directories = @(
    "public/branding/logos",
    "public/branding/mascot", 
    "public/branding/favicons",
    "public/branding/social"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# Copy files to their respective directories
$filesToCopy = @{
    "images/scap-logo-horizontal.png" = "public/branding/logos/scap-logo-horizontal.png"
    "images/scap-icon.png" = "public/branding/favicons/scap-icon.png"
    "images/favicon.png" = "public/favicon.ico"
    "images/linky-avatar.png" = "public/branding/mascot/linky-avatar.png"
    "images/linky-full.png" = "public/branding/mascot/linky-full.png"
    "images/og-image.png" = "public/branding/social/og-image.png"
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

# Create favicon.ico from favicon.png if it doesn't exist
if (-not (Test-Path "public/favicon.ico") -and (Test-Path "public/branding/favicons/scap-icon.png")) {
    Copy-Item -Path "public/branding/favicons/scap-icon.png" -Destination "public/favicon.ico" -Force
    Write-Host "Created favicon.ico from scap-icon.png"
}

Write-Host "\nBrand assets have been organized successfully!" -ForegroundColor Green
