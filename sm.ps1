param([Parameter(ValueFromRemainingArguments=$true)]$RemainingArgs)
python "$PSScriptRoot\.agents\skills\style-motion\scripts\style_motion.py" @RemainingArgs
