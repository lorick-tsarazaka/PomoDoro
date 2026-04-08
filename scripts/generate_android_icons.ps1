param(
  [Parameter(Mandatory = $true)]
  [string]$SourceIcon,
  [Parameter(Mandatory = $true)]
  [string]$AndroidRes
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourceIcon)) {
  throw "Source icon not found: $SourceIcon"
}

$sizes = @{
  'mipmap-mdpi' = 48
  'mipmap-hdpi' = 72
  'mipmap-xhdpi' = 96
  'mipmap-xxhdpi' = 144
  'mipmap-xxxhdpi' = 192
}

$source = [System.Drawing.Image]::FromFile((Resolve-Path $SourceIcon))

try {
  foreach ($entry in $sizes.GetEnumerator()) {
    $dir = Join-Path $AndroidRes $entry.Key
    if (-not (Test-Path $dir)) {
      continue
    }

    $size = [int]$entry.Value
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)

    try {
      $gfx.Clear([System.Drawing.Color]::Transparent)
      $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $gfx.DrawImage($source, 0, 0, $size, $size)

      $launcherPath = Join-Path $dir 'ic_launcher.png'
      $roundPath = Join-Path $dir 'ic_launcher_round.png'

      $bmp.Save($launcherPath, [System.Drawing.Imaging.ImageFormat]::Png)
      $bmp.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $gfx.Dispose()
      $bmp.Dispose()
    }
  }
}
finally {
  $source.Dispose()
}
