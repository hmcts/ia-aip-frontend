const multiparty = require('multiparty');

module.exports = {
  path: '/cases/documents',
  method: 'POST',
  status: (req, res, next) => {
    const form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        const { size, originalFilename } = files.files[0];
        res.send(
          {
              "documents": [
                {
                  "size": size,
                  "mimeType": "image/png",
                  "originalDocumentName": originalFilename,
                  "createdBy": "52",
                  "lastModifiedBy": "52",
                  "modifiedOn": "2020-01-16T11:56:58+0000",
                  "createdOn": "2020-01-16T11:56:58+0000",
                  "classification": "RESTRICTED",
                  "_links": {
                    "self": {
                      "href": "http://localhost:20003/documents/08a7d468-cd85-4a5c-832d-f0534b524909"
                    },
                    "binary": {
                      "href": "http://localhost:20003/documents/08a7d468-cd85-4a5c-832d-f0534b524909/binary"
                    },
                    "thumbnail": {
                      "href": "http://localhost:20003/documents/08a7d468-cd85-4a5c-832d-f0534b524909/thumbnail"
                    }
                  },
                  "_embedded": {
                    "allDocumentVersions": {
                      "_embedded": {
                        "documentVersions": [
                          {
                            "size": 1056473,
                            "mimeType": "image/png",
                            "originalDocumentName": originalFilename,
                            "createdBy": "52",
                            "createdOn": "2020-01-16T11:56:58+0000",
                            "_links": {
                              "document": {
                                "href": "http://localhost:20003/documents/08a7d468-cd85-4a5c-832d-f0534b524909"
                              },
                              "self": {
                                "href": "http://localhost:20003/documents/08a7d468-cd85-4a5c-832d-f0534b524909/versions/7f298bf1-5672-4f9c-a426-56bf9e75cd0d"
                              },
                              "binary": {
                                "href": "http://localhost:20003/documents/08a7d468-cd85-4a5c-832d-f0534b524909/versions/7f298bf1-5672-4f9c-a426-56bf9e75cd0d/binary"
                              },
                              "thumbnail": {
                                "href": "http://localhost:20003/documents/08a7d468-cd85-4a5c-832d-f0534b524909/versions/7f298bf1-5672-4f9c-a426-56bf9e75cd0d/thumbnail"
                              },
                              "migrate": {
                                "href": "http://localhost:20003/documents/08a7d468-cd85-4a5c-832d-f0534b524909/versions/7f298bf1-5672-4f9c-a426-56bf9e75cd0d/migrate"
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
          }
        )
    });
  }
};
