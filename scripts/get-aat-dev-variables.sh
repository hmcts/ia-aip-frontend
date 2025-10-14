#!/bin/zsh

VAULT=ia-aat
MAPPING=s2s-secret:S2S_SECRET,idam-secret:IDAM_SECRET,system-password:IA_SYSTEM_PASSWORD,launch-darkly-sdk-key:LAUNCH_DARKLY_SDK_KEY,addressLookupToken:ADDRESS_LOOKUP_TOKEN,saucelabs:SAUCELABS_SECRET,pcq-token-key:PCQ_TOKEN_KEY,docmosis-access-key:DOCMOSIS_ACCESS_KEY,ia-gov-notify-key:GOV_NOTIFY_KEY,system-username:IA_SYSTEM_USERNAME,test-caseofficer-username:TEST_CASEOFFICER_USERNAME,test-homeoffice-generic-username:TEST_HOMEOFFICE_GENERIC_USERNAME,test-adminofficer-username:TEST_ADMINOFFICER_USERNAME,test-judge-x-username:TEST_JUDGE_X_USERNAME,test-law-firm-share-case-a-username:TEST_LAW_FIRM_SHARE_CASE_A_USERNAME,hearing-centre-bradford-email:IA_HEARING_CENTRE_BRADFORD_EMAIL,hearing-centre-manchester-email:IA_HEARING_CENTRE_MANCHESTER_EMAIL,hearing-centre-newport-email:IA_HEARING_CENTRE_NEWPORT_EMAIL,hearing-centre-taylor-house-email:IA_HEARING_CENTRE_TAYLOR_HOUSE_EMAIL,hearing-centre-north-shields-email:IA_HEARING_CENTRE_NORTH_SHIELDS_EMAIL,hearing-centre-birmingham-email:IA_HEARING_CENTRE_BIRMINGHAM_EMAIL,hearing-centre-hatton-cross-email:IA_HEARING_CENTRE_HATTON_CROSS_EMAIL,hearing-centre-glasgow-email:IA_HEARING_CENTRE_GLASGOW_EMAIL,customer-services-email:IA_CUSTOMER_SERVICES_EMAIL

# Split comma-separated lists into arrays
mapping_arr=("${(@s/,/)MAPPING}")

# Output file
OUTPUT_FILE="aat.env"
: > "$OUTPUT_FILE" # Clear the file if it exists

for i in {1..${#mapping_arr[@]}}; do
  map="${mapping_arr[$i]}"
  map_arr=("${(@s/:/)map}")
  SECRET=${map_arr[1]}
  VAR="${map_arr[2]}"
  VALUE=$(az keyvault secret show --name "$SECRET" --vault-name "$VAULT" --query value -o tsv 2>/dev/null)
  if [[ $? -ne 0 ]]; then
    echo "secret not found" for ${VAR}
  fi
  echo "${VAR}=${VALUE}" >> "$OUTPUT_FILE"
done

echo "IA_CUSTOMER_SERVICES_TELEPHONE=111123111" >> "$OUTPUT_FILE"
