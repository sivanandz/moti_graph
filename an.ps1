param([Parameter(ValueFromRemainingArguments=$true)]$RemainingArgs)
node "$PSScriptRoot\.agents\skills\animate\tools\animate.mjs" @RemainingArgs
