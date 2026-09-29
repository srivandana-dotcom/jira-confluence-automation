#Requires -Version 5.1
<#
Minimal MCP stdio server exposing a single "get_time" tool.
Protocol: newline-delimited JSON-RPC 2.0 messages over stdin/stdout (MCP stdio transport).
#>

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[Console]::InputEncoding = $utf8NoBom
[Console]::OutputEncoding = $utf8NoBom

function Write-Message {
    param($Object)
    $json = $Object | ConvertTo-Json -Depth 10 -Compress
    [Console]::Out.Write($json + "`n")
    [Console]::Out.Flush()
}

$serverInfo = @{ name = "time-windows"; version = "1.0.0" }
$getTimeTool = @{
    name        = "get_time"
    description = "Returns the current system clock time."
    inputSchema = @{
        type       = "object"
        properties = @{}
        required   = @()
    }
}

while ($true) {
    $line = [Console]::In.ReadLine()
    if ($null -eq $line) { break }
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    try {
        $request = $line | ConvertFrom-Json
    } catch {
        continue
    }

    $method = $request.method
    $id = $request.id

    switch ($method) {
        "initialize" {
            Write-Message @{
                jsonrpc = "2.0"
                id      = $id
                result  = @{
                    protocolVersion = "2024-11-05"
                    capabilities    = @{ tools = @{} }
                    serverInfo      = $serverInfo
                }
            }
        }
        "tools/list" {
            Write-Message @{
                jsonrpc = "2.0"
                id      = $id
                result  = @{ tools = @($getTimeTool) }
            }
        }
        "tools/call" {
            $toolName = $request.params.name
            if ($toolName -eq "get_time") {
                $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss K"
                Write-Message @{
                    jsonrpc = "2.0"
                    id      = $id
                    result  = @{ content = @(@{ type = "text"; text = $now }) }
                }
            } else {
                Write-Message @{
                    jsonrpc = "2.0"
                    id      = $id
                    error   = @{ code = -32601; message = "Unknown tool: $toolName" }
                }
            }
        }
        "ping" {
            Write-Message @{ jsonrpc = "2.0"; id = $id; result = @{} }
        }
        "notifications/initialized" {
            # notification, no response expected
        }
        default {
            if ($null -ne $id) {
                Write-Message @{
                    jsonrpc = "2.0"
                    id      = $id
                    error   = @{ code = -32601; message = "Method not found: $method" }
                }
            }
        }
    }
}
