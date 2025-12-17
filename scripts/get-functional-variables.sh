#!/bin/zsh

# Output file
OUTPUT_FILE="functional.env"
: > "$OUTPUT_FILE" # Clear the file if it exists

LAUNCH_DARKLY_SDK_KEY=$(az keyvault secret show --name "launch-darkly-sdk-key" --vault-name "ia-aat" --query value -o tsv 2>/dev/null)
echo "LAUNCH_DARKLY_SDK_KEY=$LAUNCH_DARKLY_SDK_KEY" >> "$OUTPUT_FILE"
echo "TEST_URL=https://localhost:3000" >> "$OUTPUT_FILE"
echo "USE_REDIS=false" >> "$OUTPUT_FILE"
echo "IDAM_WEB_URL=http://localhost:20001" >> "$OUTPUT_FILE"
echo "IDAM_API_URL=http://localhost:20001" >> "$OUTPUT_FILE"
echo "CCD_API_URL=http://localhost:20000" >> "$OUTPUT_FILE"
echo "ADDRESS_LOOKUP_URL=http://localhost:20002" >> "$OUTPUT_FILE"
echo "DOC_MANAGEMENT_URL=http://localhost:20003" >> "$OUTPUT_FILE"
echo "CASE_DOCUMENT_AM_URL=http://localhost:20003" >> "$OUTPUT_FILE"
echo "NODE_ENV=test" >> "$OUTPUT_FILE"
echo "DEFAULT_LAUNCH_DARKLY_FLAG=true" >> "$OUTPUT_FILE"
