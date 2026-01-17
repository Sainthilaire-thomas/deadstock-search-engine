# ============================================================================
# Generate Project File Tree Documentation
# ============================================================================
# Purpose: Create comprehensive file tree documentation for the project
# Output: docs/FILE_TREE.md
# ============================================================================

Write-Host "Generating project file tree documentation..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$projectRoot = $PSScriptRoot | Split-Path
$outputFile = Join-Path $projectRoot "docs\FILE_TREE.md"
$docsDir = Join-Path $projectRoot "docs"

# Create docs directory if it doesn't exist
if (-Not (Test-Path $docsDir)) {
    New-Item -Path $docsDir -ItemType Directory -Force | Out-Null
    Write-Host "Created docs directory" -ForegroundColor Green
}

# Directories to exclude
$excludeDirs = @(
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    "coverage",
    ".vercel",
    "public"
)

# ============================================================================
# Helper Functions
# ============================================================================

function Test-ShouldExclude {
    param([string]$FullPath)
    
    foreach ($dir in $excludeDirs) {
        if ($FullPath -match "[\\/]$dir([\\/]|$)") {
            return $true
        }
    }
    return $false
}

function Get-FileTreeRecursive {
    param(
        [string]$Path,
        [string]$Prefix = "",
        [int]$MaxDepth = 10,
        [int]$CurrentDepth = 0
    )
    
    if ($CurrentDepth -ge $MaxDepth) {
        return @()
    }
    
    $result = @()
    
    try {
        $items = Get-ChildItem -Path $Path -ErrorAction SilentlyContinue | 
                 Where-Object { 
                     -not ($_.PSIsContainer -and $excludeDirs -contains $_.Name) 
                 } |
                 Sort-Object { -not $_.PSIsContainer }, Name
        
        $itemCount = $items.Count
        $currentIndex = 0
        
        foreach ($item in $items) {
            $currentIndex++
            $isLast = ($currentIndex -eq $itemCount)
            
            # Determine tree characters
            if ($isLast) {
                $branch = "+-- "
                $extension = "    "
            } else {
                $branch = "|-- "
                $extension = "|   "
            }
            
            # Get item info
            $displayName = $item.Name
            if ($item.PSIsContainer) {
                $displayName = "$displayName/"
            }
            
            # Add line to result
            $result += "$Prefix$branch$displayName"
            
            # Recurse into directories
            if ($item.PSIsContainer) {
                $childLines = Get-FileTreeRecursive -Path $item.FullName -Prefix "$Prefix$extension" -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
                $result += $childLines
            }
        }
    } catch {
        Write-Host "   Error reading: $Path" -ForegroundColor Yellow
    }
    
    return $result
}

function Get-FileStatistics {
    param([string]$Path)
    
    $stats = @{
        TotalFiles = 0
        TotalDirs = 0
        TypeScript = 0
        JavaScript = 0
        Markdown = 0
        SQL = 0
        JSON = 0
        CSS = 0
        Other = 0
    }
    
    # Count files
    Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { -not (Test-ShouldExclude $_.FullName) } |
        ForEach-Object {
            $stats.TotalFiles++
            switch ($_.Extension) {
                { $_ -in ".ts", ".tsx" } { $stats.TypeScript++ }
                { $_ -in ".js", ".jsx" } { $stats.JavaScript++ }
                ".md"   { $stats.Markdown++ }
                ".sql"  { $stats.SQL++ }
                ".json" { $stats.JSON++ }
                ".css"  { $stats.CSS++ }
                default { $stats.Other++ }
            }
        }
    
    # Count directories (excluding node_modules etc.)
    Get-ChildItem -Path $Path -Recurse -Directory -ErrorAction SilentlyContinue |
        Where-Object { -not (Test-ShouldExclude $_.FullName) } |
        ForEach-Object {
            $stats.TotalDirs++
        }
    
    return $stats
}

# ============================================================================
# Generate Documentation
# ============================================================================

Write-Host "Generating file tree..." -ForegroundColor Yellow

$content = @"
# Project File Tree

**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

---

## Project Statistics

"@

# Get statistics
Write-Host "   Analyzing files..." -ForegroundColor Gray
$stats = Get-FileStatistics -Path $projectRoot

$content += @"

| Metric | Count |
|--------|-------|
| Total Files | $($stats.TotalFiles) |
| Total Directories | $($stats.TotalDirs) |
| TypeScript Files (.ts/.tsx) | $($stats.TypeScript) |
| JavaScript Files (.js/.jsx) | $($stats.JavaScript) |
| Markdown Files (.md) | $($stats.Markdown) |
| SQL Files (.sql) | $($stats.SQL) |
| JSON Files (.json) | $($stats.JSON) |
| CSS Files (.css) | $($stats.CSS) |
| Other Files | $($stats.Other) |

---

## Complete File Tree

``````
deadstock-search-engine/
"@

# Generate tree with increased depth
Write-Host "   Building tree structure (depth: 10)..." -ForegroundColor Gray
$treeLines = Get-FileTreeRecursive -Path $projectRoot -MaxDepth 10
$treeString = $treeLines -join "`n"
$content += "`n$treeString`n"

$content += @"
``````

---

## TypeScript Files by Feature

"@

# List TypeScript files by feature - ALL features
Write-Host "   Cataloging TypeScript files by feature..." -ForegroundColor Gray

$features = @("admin", "auth", "boards", "favorites", "journey", "normalization", "pattern", "search", "tuning")

foreach ($feature in $features) {
    $featurePath = Join-Path $projectRoot "src\features\$feature"
    
    if (Test-Path $featurePath) {
        $content += "`n### Feature: ``$feature```n`n"
        
        $tsFiles = Get-ChildItem -Path $featurePath -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue |
                   Where-Object { $_.Name -notlike "*.test.ts" -and $_.Name -notlike "*.spec.ts" } |
                   Sort-Object FullName |
                   ForEach-Object {
                       $relativePath = $_.FullName.Replace($projectRoot, "").Replace("\", "/")
                       "- ``$relativePath``"
                   }
        
        if ($tsFiles) {
            $content += ($tsFiles -join "`n")
            $content += "`n"
        } else {
            $content += "_No TypeScript files found_`n"
        }
    }
}

$content += @"

---

## API Routes

"@

# List API routes
Write-Host "   Cataloging API routes..." -ForegroundColor Gray
$apiPath = Join-Path $projectRoot "src\app\api"
if (Test-Path $apiPath) {
   $apiRoutes = Get-ChildItem -Path $apiPath -Recurse -Filter "route.ts" -ErrorAction SilentlyContinue |
             Sort-Object FullName |
             ForEach-Object {
                 $relativePath = $_.Directory.FullName.Replace($projectRoot, "").Replace("\", "/").Replace("/src/app/api", "")
                 "- ``/api$relativePath``"
             }
    
    if ($apiRoutes) {
        $content += "`n" + ($apiRoutes -join "`n") + "`n"
    } else {
        $content += "`n_No API routes found_`n"
    }
}

$content += @"

---

## Database Files

"@

# List database files
$dbPath = Join-Path $projectRoot "database"
if (Test-Path $dbPath) {
    # Migrations
    $content += "`n### Migrations`n`n"
    $migrationsPath = Join-Path $dbPath "migrations"
    if (Test-Path $migrationsPath) {
        $migrations = Get-ChildItem -Path $migrationsPath -Filter "*.sql" -ErrorAction SilentlyContinue |
                      Sort-Object Name |
                      ForEach-Object { "- ``$($_.Name)``" }
        
        if ($migrations) {
            $content += ($migrations -join "`n")
            $content += "`n"
        } else {
            $content += "_No migrations found_`n"
        }
    } else {
        $content += "_No migrations directory found_`n"
    }
    
    # Seeds
    $content += "`n### Seeds`n`n"
    $seedsPath = Join-Path $dbPath "seeds"
    if (Test-Path $seedsPath) {
        $seeds = Get-ChildItem -Path $seedsPath -Filter "*.sql" -ErrorAction SilentlyContinue |
                 Sort-Object Name |
                 ForEach-Object { "- ``$($_.Name)``" }
        
        if ($seeds) {
            $content += ($seeds -join "`n")
            $content += "`n"
        } else {
            $content += "_No seeds found_`n"
        }
    } else {
        $content += "_No seeds directory found_`n"
    }
}

$content += @"

---

## Components Summary

"@

# List UI components
Write-Host "   Cataloging components..." -ForegroundColor Gray
$componentsPath = Join-Path $projectRoot "src\components"
if (Test-Path $componentsPath) {
    $componentDirs = Get-ChildItem -Path $componentsPath -Directory -ErrorAction SilentlyContinue |
                     Sort-Object Name
    
    foreach ($dir in $componentDirs) {
        $content += "`n### ``components/$($dir.Name)/```n`n"
        
        $components = Get-ChildItem -Path $dir.FullName -Filter "*.tsx" -ErrorAction SilentlyContinue |
                      Sort-Object Name |
                      ForEach-Object { "- ``$($_.Name)``" }
        
        if ($components) {
            $content += ($components -join "`n")
            $content += "`n"
        }
    }
}

$content += @"

---

## Configuration Files

"@

# List config files
$configFiles = @(
    @{ Name = "package.json"; Required = $true },
    @{ Name = "tsconfig.json"; Required = $true },
    @{ Name = "next.config.ts"; Required = $true },
    @{ Name = "next.config.js"; Required = $false },
    @{ Name = "tailwind.config.ts"; Required = $true },
    @{ Name = "postcss.config.mjs"; Required = $true },
    @{ Name = "eslint.config.mjs"; Required = $false },
    @{ Name = ".env.local"; Required = $true },
    @{ Name = ".env.example"; Required = $false },
    @{ Name = "components.json"; Required = $false }
)

$content += "`n| File | Status |`n|------|--------|`n"

foreach ($file in $configFiles) {
    $filePath = Join-Path $projectRoot $file.Name
    if (Test-Path $filePath) {
        $content += "| ``$($file.Name)`` | ✅ EXISTS |`n"
    } else {
        $status = if ($file.Required) { "❌ MISSING" } else { "⚪ Optional" }
        $content += "| ``$($file.Name)`` | $status |`n"
    }
}

$content += @"

---

## Excluded from Tree

The following directories are excluded from this documentation:

"@

foreach ($dir in $excludeDirs) {
    $content += "- ``$dir/```n"
}

$content += @"

---

## Last Updated

**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

**Command to regenerate:**
``````powershell
npm run docs:tree
``````

Or manually:
``````powershell
.\scripts\generate-file-tree.ps1
``````

---

**Note:** This file is auto-generated. Do not edit manually.
"@

# Write to file with UTF-8 encoding (no BOM)
Write-Host "   Writing to file..." -ForegroundColor Gray
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText($outputFile, $content, $Utf8NoBomEncoding)

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host " File tree documentation generated!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "   Output: $outputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Statistics:" -ForegroundColor Yellow
Write-Host "   Total Files:       $($stats.TotalFiles)" -ForegroundColor White
Write-Host "   Total Directories: $($stats.TotalDirs)" -ForegroundColor White
Write-Host "   TypeScript Files:  $($stats.TypeScript)" -ForegroundColor White
Write-Host "   Markdown Files:    $($stats.Markdown)" -ForegroundColor White
Write-Host "   SQL Files:         $($stats.SQL)" -ForegroundColor White
Write-Host ""
