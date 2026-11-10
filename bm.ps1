param([Parameter(ValueFromRemainingArguments=$true)]$RemainingArgs)
node "$PSScriptRoot\.agents\skills\bang-motion\scripts\cli.mjs" @RemainingArgs
