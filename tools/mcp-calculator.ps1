#Requires -Version 5.1
<#
Minimal MCP stdio server exposing a single "calculate" tool.
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

$serverInfo = @{ name = "calculator-windows"; version = "1.0.0" }
$calculateTool = @{
    name        = "calculate"
    description = "Performs a basic arithmetic operation (add, subtract, multiply, divide) on two numbers."
    inputSchema = @{
        type       = "object"
        properties = @{
            a         = @{ type = "number"; description = "The first operand." }
            b         = @{ type = "number"; description = "The second operand." }
            operation = @{ type = "string"; description = "One of: add, subtract, multiply, divide."; enum = @("add", "subtract", "multiply", "divide") }
        }
        required   = @("a", "b", "operation")
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
                result  = @{ tools = @($calculateTool) }
            }
        }
        "tools/call" {
            $toolName = $request.params.name
            if ($toolName -eq "calculate") {
                $a = [double]$request.params.arguments.a
                $b = [double]$request.params.arguments.b
                $operation = $request.params.arguments.operation

                $result = $null
                $errorMessage = $null
                switch ($operation) {
                    "add" { $result = $a + $b }
                    "subtract" { $result = $a - $b }
                    "multiply" { $result = $a * $b }
                    "divide" {
                        if ($b -eq 0) {
                            $errorMessage = "Division by zero"
                        } else {
                            $result = $a / $b
                        }
                    }
                    default { $errorMessage = "Unknown operation: $operation" }
                }

                if ($null -ne $errorMessage) {
                    Write-Message @{
                        jsonrpc = "2.0"
                        id      = $id
                        result  = @{ content = @(@{ type = "text"; text = $errorMessage }); isError = $true }
                    }
                } else {
                    Write-Message @{
                        jsonrpc = "2.0"
                        id      = $id
                        result  = @{ content = @(@{ type = "text"; text = "$result" }) }
                    }
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
