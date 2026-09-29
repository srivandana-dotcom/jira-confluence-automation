#Requires -Version 5.1
<#
Minimal MCP stdio server exposing a single "echo" tool.
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

$serverInfo = @{ name = "echo-windows"; version = "1.0.0" }
$echoTool = @{
    name        = "echo"
    description = "Echoes back the provided message."
    inputSchema = @{
        type       = "object"
        properties = @{
            message = @{ type = "string"; description = "The message to echo back." }
        }
        required   = @("message")
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
                result  = @{ tools = @($echoTool) }
            }
        }
        "tools/call" {
            $toolName = $request.params.name
            if ($toolName -eq "echo") {
                $message = $request.params.arguments.message
                Write-Message @{
                    jsonrpc = "2.0"
                    id      = $id
                    result  = @{ content = @(@{ type = "text"; text = $message }) }
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
