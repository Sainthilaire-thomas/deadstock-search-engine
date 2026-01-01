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

function Get-FileTreeRecursive {
    param(
        [string]$Path,
        [string]$Prefix = "",
        [int]$MaxDepth = 5,
        [int]$CurrentDepth = 0
    )
    
    if ($CurrentDepth -ge $MaxDepth) {
        return
    }
    
    try {
        $items = Get-ChildItem -Path $Path -ErrorAction SilentlyContinue | 
                 Where-Object { 
                     -not ($_.PSIsContainer -and $excludeDirs -contains $_.Name) 
                 } |
                 Sort-Object { $_.PSIsContainer }, Name
        
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
            
            # Write line
            "$Prefix$branch$displayName"
            
            # Recurse into directories
            if ($item.PSIsContainer) {
                Get-FileTreeRecursive -Path $item.FullName -Prefix "$Prefix$extension" -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
            }
        }
    } catch {
        Write-Host "   Error reading: $Path" -ForegroundColor Yellow
    }
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
        Other = 0
    }
    
    Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { 
            $exclude = $false
            foreach ($dir in $excludeDirs) {
                if ($_.FullName -like "*\$dir\*") {
                    $exclude = $true
                    break
                }
            }
            -not $exclude
        } |
        ForEach-Object {
            $stats.TotalFiles++
            switch ($_.Extension) {
                { $_ -in ".ts", ".tsx" } { $stats.TypeScript++ }
                { $_ -in ".js", ".jsx" } { $stats.JavaScript++ }
                ".md"   { $stats.Markdown++ }
                ".sql"  { $stats.SQL++ }
                ".json" { $stats.JSON++ }
                default { $stats.Other++ }
            }
        }
    
    Get-ChildItem -Path $Path -Recurse -Directory -ErrorAction SilentlyContinue |
        Where-Object { 
            -not ($excludeDirs -contains $_.Name)
        } |
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
| TypeScript Files | $($stats.TypeScript) |
| JavaScript Files | $($stats.JavaScript) |
| Markdown Files | $($stats.Markdown) |
| SQL Files | $($stats.SQL) |
| JSON Files | $($stats.JSON) |
| Other Files | $($stats.Other) |

---

## Complete File Tree

``````
deadstock-search-engine/
"@

# Generate tree
Write-Host "   Building tree structure..." -ForegroundColor Gray
$tree = Get-FileTreeRecursive -Path $projectRoot -MaxDepth 6
$content += "`n$tree`n"

$content += @"
``````

---

## TypeScript Files by Feature

"@

# List TypeScript files by feature
Write-Host "   Cataloging TypeScript files..." -ForegroundColor Gray

$features = @("admin", "normalization", "tuning")

foreach ($feature in $features) {
    $featurePath = Join-Path $projectRoot "src\features\$feature"
    
    if (Test-Path $featurePath) {
        $content += "`n### Feature: ``$feature```n`n"
        
        $tsFiles = Get-ChildItem -Path $featurePath -Recurse -Filter "*.ts" -ErrorAction SilentlyContinue |
                   Where-Object { $_.Name -notlike "*.test.ts" -and $_.Name -notlike "*.spec.ts" } |
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

## Configuration Files

"@

# List config files
$configFiles = @("package.json", "tsconfig.json", "next.config.js", ".env.example", "tailwind.config.ts")
$content += "`n"

foreach ($file in $configFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        $content += "- ``$file`` [EXISTS]`n"
    } else {
        $content += "- ``$file`` [MISSING]`n"
    }
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

# Write to file
Write-Host "   Writing to file..." -ForegroundColor Gray
$content | Out-File -FilePath $outputFile -Encoding UTF8 -Force

Write-Host ""
Write-Host "File tree documentation generated!" -ForegroundColor Green
Write-Host "   Output: $outputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Statistics:" -ForegroundColor Yellow
Write-Host "   Total Files: $($stats.TotalFiles)" -ForegroundColor White
Write-Host "   Total Directories: $($stats.TotalDirs)" -ForegroundColor White
Write-Host "   TypeScript Files: $($stats.TypeScript)" -ForegroundColor White
Write-Host ""
