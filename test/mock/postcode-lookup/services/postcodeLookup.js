module.exports = {
  path: '/places/v1/addresses/postcode',
  method: 'GET',
  template: params => {
    return {
      "header": {
        "uri": "https://api.os.uk/places/v1/addresses/postcode?offset=0&postcode=W1W%207RT",
        "query": "postcode=W1W 7RT",
        "offset": 0,
        "totalresults": 3,
        "format": "JSON",
        "dataset": "DPA",
        "lr": "EN,CY",
        "maxresults": 100,
        "epoch": "72",
        "output_srs": "EPSG:27700"
      },
      "results": [
        {
          "DPA": {
            "UPRN": "10091856478",
            "UDPRN": "52526732",
            "ADDRESS": "MISCHIEF P R, 60, GREAT PORTLAND STREET, LONDON, W1W 7RT",
            "ORGANISATION_NAME": "MISCHIEF P R",
            "BUILDING_NUMBER": "60",
            "THOROUGHFARE_NAME": "GREAT PORTLAND STREET",
            "POST_TOWN": "LONDON",
            "POSTCODE": "W1W 7RT",
            "RPC": "2",
            "X_COORDINATE": 529052.54,
            "Y_COORDINATE": 181514.14,
            "STATUS": "APPROVED",
            "LOGICAL_STATUS_CODE": "1",
            "CLASSIFICATION_CODE": "OR04",
            "CLASSIFICATION_CODE_DESCRIPTION": "Additional Mail / Packet Addressee",
            "LOCAL_CUSTODIAN_CODE": 7655,
            "LOCAL_CUSTODIAN_CODE_DESCRIPTION": "ORDNANCE SURVEY",
            "POSTAL_ADDRESS_CODE": "D",
            "POSTAL_ADDRESS_CODE_DESCRIPTION": "A record which is linked to PAF",
            "BLPU_STATE_CODE": null,
            "BLPU_STATE_CODE_DESCRIPTION": "Unknown/Not applicable",
            "TOPOGRAPHY_LAYER_TOID": "osgb1000005427116",
            "PARENT_UPRN": "10033591074",
            "LAST_UPDATE_DATE": "10/02/2016",
            "ENTRY_DATE": "19/03/2012",
            "LANGUAGE": "EN",
            "MATCH": 1,
            "MATCH_DESCRIPTION": "EXACT"
          }
        },
        {
          "DPA": {
            "UPRN": "10033591074",
            "UDPRN": "55067977",
            "ADDRESS": "O R C INTERNATIONAL LTD, 60, GREAT PORTLAND STREET, LONDON, W1W 7RT",
            "ORGANISATION_NAME": "O R C INTERNATIONAL LTD",
            "BUILDING_NUMBER": "60",
            "THOROUGHFARE_NAME": "GREAT PORTLAND STREET",
            "POST_TOWN": "LONDON",
            "POSTCODE": "W1W 7RT",
            "RPC": "2",
            "X_COORDINATE": 529052.54,
            "Y_COORDINATE": 181514.14,
            "STATUS": "APPROVED",
            "LOGICAL_STATUS_CODE": "1",
            "CLASSIFICATION_CODE": "CO01",
            "CLASSIFICATION_CODE_DESCRIPTION": "Office / Work Studio",
            "LOCAL_CUSTODIAN_CODE": 5990,
            "LOCAL_CUSTODIAN_CODE_DESCRIPTION": "CITY OF WESTMINSTER",
            "POSTAL_ADDRESS_CODE": "D",
            "POSTAL_ADDRESS_CODE_DESCRIPTION": "A record which is linked to PAF",
            "BLPU_STATE_CODE": "2",
            "BLPU_STATE_CODE_DESCRIPTION": "In use",
            "TOPOGRAPHY_LAYER_TOID": "osgb1000005427116",
            "LAST_UPDATE_DATE": "01/01/2017",
            "ENTRY_DATE": "06/11/2006",
            "BLPU_STATE_DATE": "06/11/2006",
            "LANGUAGE": "EN",
            "MATCH": 1,
            "MATCH_DESCRIPTION": "EXACT"
          }
        },
        {
          "DPA": {
            "UPRN": "10033628324",
            "UDPRN": "25762263",
            "ADDRESS": "SYNERGY, 60, GREAT PORTLAND STREET, LONDON, W1W 7RT",
            "ORGANISATION_NAME": "SYNERGY",
            "BUILDING_NUMBER": "60",
            "THOROUGHFARE_NAME": "GREAT PORTLAND STREET",
            "POST_TOWN": "LONDON",
            "POSTCODE": "W1W 7RT",
            "RPC": "1",
            "X_COORDINATE": 529052.54,
            "Y_COORDINATE": 181514.14,
            "STATUS": "HISTORICAL",
            "LOGICAL_STATUS_CODE": "8",
            "CLASSIFICATION_CODE": "CO01",
            "CLASSIFICATION_CODE_DESCRIPTION": "Office / Work Studio",
            "LOCAL_CUSTODIAN_CODE": 5990,
            "LOCAL_CUSTODIAN_CODE_DESCRIPTION": "CITY OF WESTMINSTER",
            "POSTAL_ADDRESS_CODE": "D",
            "POSTAL_ADDRESS_CODE_DESCRIPTION": "A record which is linked to PAF",
            "BLPU_STATE_CODE": null,
            "BLPU_STATE_CODE_DESCRIPTION": "Unknown/Not applicable",
            "TOPOGRAPHY_LAYER_TOID": "osgb1000005427116",
            "LAST_UPDATE_DATE": "01/01/2017",
            "ENTRY_DATE": "29/05/2015",
            "LANGUAGE": "EN",
            "MATCH": 1,
            "MATCH_DESCRIPTION": "EXACT"
          }
        }
      ]
    };
  }
}
