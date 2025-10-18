# Path to the favicon in the public directory
$faviconPath = "frontend\public\favicon.ico"

# Check if favicon exists
if (-not (Test-Path $faviconPath)) {
    Write-Host "Favicon not found at $faviconPath"
    
    # Try to find an alternative favicon
    $altFavicon = Get-ChildItem -Path . -Recurse -Filter "favicon.ico" | Select-Object -First 1
    
    if ($altFavicon) {
        # Copy the first found favicon to the public directory
        Copy-Item -Path $altFavicon.FullName -Destination $faviconPath -Force
        Write-Host "Copied favicon from $($altFavicon.FullName) to $faviconPath"
    } else {
        # Create a simple favicon if none exists
        Write-Host "Creating a simple favicon..."
        
        # Create a temporary image file
        $tempImage = "$env:TEMP\scap_favicon.png"
        
        # Create a simple blue square image as a fallback
        Add-Type -AssemblyName System.Drawing
        $bitmap = New-Object System.Drawing.Bitmap(32, 32)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.Clear([System.Drawing.Color]::FromArgb(37, 99, 235)) # Blue-600
        $font = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
        $brush = [System.Drawing.Brushes]::White
        $graphics.DrawString("S", $font, $brush, 8, 4)
        $bitmap.Save($tempImage, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Convert to .ico using System.Drawing.Icon
        $icon = [System.Drawing.Icon]::FromHandle(([System.Drawing.Bitmap]::FromFile($tempImage)).GetHicon())
        $iconStream = New-Object System.IO.FileStream($faviconPath, [System.IO.FileMode]::Create)
        $icon.Save($iconStream)
        $iconStream.Close()
        $icon.Dispose()
        
        # Clean up
        Remove-Item $tempImage -ErrorAction SilentlyContinue
        Write-Host "Created a new favicon at $faviconPath"
    }
} else {
    Write-Host "Favicon already exists at $faviconPath"
}
