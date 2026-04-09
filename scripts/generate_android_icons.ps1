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
$sourceBitmap = New-Object System.Drawing.Bitmap($source)

function Get-NonTransparentBounds {
  param([System.Drawing.Bitmap]$Bitmap)

  $minX = $Bitmap.Width
  $minY = $Bitmap.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $Bitmap.Height; $y++) {
    for ($x = 0; $x -lt $Bitmap.Width; $x++) {
      $pixel = $Bitmap.GetPixel($x, $y)
      if ($pixel.A -gt 0) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt $minX -or $maxY -lt $minY) {
    return [System.Drawing.Rectangle]::FromLTRB(0, 0, $Bitmap.Width, $Bitmap.Height)
  }

  return [System.Drawing.Rectangle]::FromLTRB($minX, $minY, $maxX + 1, $maxY + 1)
}

$sourceBounds = Get-NonTransparentBounds -Bitmap $sourceBitmap

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

      # Crop transparent padding from source, then fill the whole mipmap canvas.
      $destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
      $gfx.DrawImage($sourceBitmap, $destRect, $sourceBounds, [System.Drawing.GraphicsUnit]::Pixel)

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
  $sourceBitmap.Dispose()
  $source.Dispose()
}
