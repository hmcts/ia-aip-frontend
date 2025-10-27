#!/bin/zsh
if [ -z "$1" ]; then
    echo "Missing environment variable. Usage: $0 <ENVIRONMENT> <PR_NUMBER (optional)>"
    exit 1
fi
ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "aat" ] && [ "$ENVIRONMENT" != "pr-aip" ] && [ "$ENVIRONMENT" != "pr-case-api" ]; then
    echo "Environment variable must be aat, pr-aip or pr-case-api. Usage: $0 <ENVIRONMENT> <PR_NUMBER (optional)>"
    exit 1
fi

if [ "$ENVIRONMENT" != "aat" ] && [ -z "$2" ]; then
    echo "PR_NUMBER is required when environment is not 'aat'. Usage: $0 <ENVIRONMENT> <PR_NUMBER>"
    exit 1
fi
PR_NUMBER=$2

# Output file
OUTPUT_FILE="createCase.env"
: > "$OUTPUT_FILE" # Clear the file if it exists

TEST_CASEOFFICER_PASSWORD=$(az keyvault secret show --name "test-caseofficer-password" --vault-name "ia-aat" --query value -o tsv 2>/dev/null)
TEST_LAW_FIRM_SHARE_CASE_A_PASSWORD=$(az keyvault secret show --name "test-law-firm-share-case-a-password" --vault-name "ia-aat" --query value -o tsv 2>/dev/null)
TEST_HOMEOFFICE_GENERIC_PASSWORD=$(az keyvault secret show --name "test-homeoffice-generic-password" --vault-name "ia-aat" --query value -o tsv 2>/dev/null)
TEST_ADMINOFFICER_PASSWORD=$(az keyvault secret show --name "test-adminofficer-password" --vault-name "ia-aat" --query value -o tsv 2>/dev/null)
TEST_JUDGE_X_PASSWORD=$(az keyvault secret show --name "test-judge-x-password" --vault-name "ia-aat" --query value -o tsv 2>/dev/null)
IDAM_SECRET=$(az keyvault secret show --name "idam-secret" --vault-name "ia-aat" --query value -o tsv 2>/dev/null)
S2S_SECRET=$(az keyvault secret show --name "s2s-secret" --vault-name "ia-aat" --query value -o tsv 2>/dev/null)

IDAM_CLIENT_SECRET=$(az keyvault secret show --name "mc-idam-client-secret" --vault-name "rpx-aat" --query value -o tsv 2>/dev/null)

echo "TEST_CASEOFFICER_PASSWORD=$TEST_CASEOFFICER_PASSWORD" >> "$OUTPUT_FILE"
echo "TEST_LAW_FIRM_SHARE_CASE_A_PASSWORD=$TEST_LAW_FIRM_SHARE_CASE_A_PASSWORD" >> "$OUTPUT_FILE"
echo "TEST_HOMEOFFICE_GENERIC_PASSWORD=$TEST_HOMEOFFICE_GENERIC_PASSWORD" >> "$OUTPUT_FILE"
echo "TEST_ADMINOFFICER_PASSWORD=$TEST_ADMINOFFICER_PASSWORD" >> "$OUTPUT_FILE"
echo "TEST_JUDGE_X_PASSWORD=$TEST_JUDGE_X_PASSWORD" >> "$OUTPUT_FILE"
echo "IDAM_SECRET=$IDAM_SECRET" >> "$OUTPUT_FILE"
echo "S2S_SECRET=$S2S_SECRET" >> "$OUTPUT_FILE"

echo "IDAM_CLIENT_SECRET=$IDAM_CLIENT_SECRET" >> "$OUTPUT_FILE"

echo "S2S_MICROSERVICE_NAME=iac" >> "$OUTPUT_FILE"
echo "S2S_URL=http://rpe-service-auth-provider-aat.service.core-compute-aat.internal" >> "$OUTPUT_FILE"
echo "PAYMENTS_API_URL=http://payment-api-aat.service.core-compute-aat.internal" >> "$OUTPUT_FILE"
echo "REF_DATA_API_URL=http://rd-commondata-api-aat.service.core-compute-aat.internal" >> "$OUTPUT_FILE"
echo "IDAM_WEB_URL=https://idam-web-public.aat.platform.hmcts.net" >> "$OUTPUT_FILE"
echo "IDAM_API_URL=https://idam-api.aat.platform.hmcts.net" >> "$OUTPUT_FILE"
echo "PCQ_URL=https://pcq.aat.platform.hmcts.net" >> "$OUTPUT_FILE"
echo "IDAM_TESTING_SUPPORT_URL=https://idam-testing-support-api.aat.platform.hmcts.net" >> "$OUTPUT_FILE"
echo "TEST_CASEOFFICER_USERNAME=iac-base-func-test01@justice.gov.uk" >> "$OUTPUT_FILE"
echo "TEST_HOMEOFFICE_GENERIC_USERNAME=ia.respondentoffice.ccd@gmail.com" >> "$OUTPUT_FILE"
echo "TEST_ADMINOFFICER_USERNAME=CRD_func_test_aat_adm66@justice.gov.uk" >> "$OUTPUT_FILE"
echo "TEST_JUDGE_X_USERNAME=ia.iacjudge.ccd@gmail.com" >> "$OUTPUT_FILE"
echo "TEST_LAW_FIRM_SHARE_CASE_A_USERNAME=ialegalreporgcreator12@mailnesia.com" >> "$OUTPUT_FILE"

if [ "$ENVIRONMENT" = "aat" ]; then
    echo "CCD_API_URL=http://ccd-data-store-api-aat.service.core-compute-aat.internal" >> "$OUTPUT_FILE"
    echo "TEST_URL=https://immigration-appeal.aat.platform.hmcts.net/" >> "$OUTPUT_FILE"
    echo "PCQ_RETURN_URL=https://immigration-appeal.aat.platform.hmcts.net/about-appeal" >> "$OUTPUT_FILE"
fi

if [ "$ENVIRONMENT" = "pr-case-api" ]; then
    echo "CCD_API_URL=https://ccd-data-store-api-ia-case-api-pr-${PR_NUMBER}.preview.platform.hmcts.net" >> "$OUTPUT_FILE"
    echo "TEST_URL=https://ia-case-api-pr-${PR_NUMBER}-aip-frontend.preview.platform.hmcts.net" >> "$OUTPUT_FILE"
    echo "PCQ_RETURN_URL=https://ia-case-api-pr-${PR_NUMBER}-aip-frontend.preview.platform.hmcts.net/about-appeal" >> "$OUTPUT_FILE"
fi

if [ "$ENVIRONMENT" = "pr-aip" ]; then
    echo "CCD_API_URL=http://ccd-data-store-api-aat.service.core-compute-aat.internal" >> "$OUTPUT_FILE"
    echo "TEST_URL=https://ia-aip-frontend-pr-${PR_NUMBER}.preview.platform.hmcts.net/" >> "$OUTPUT_FILE"
    echo "PCQ_RETURN_URL=https://ia-aip-frontend-pr-${PR_NUMBER}.preview.platform.hmcts.net/about-appeal" >> "$OUTPUT_FILE"
fi
