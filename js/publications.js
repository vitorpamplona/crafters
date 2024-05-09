const PUBLICATION_TAGNAME    = 0; // "n", // education / courses
const PUBLICATION_DOI        = 1; // "<PUBLICATION's DOI>",  // can be blank if not on Nostr yet.
const PUBLICATION_TITLE      = 2; // "<PUBLICATION title>", 
const PUBLICATION_AUTHORS    = 3; // "Authors", 
const PUBLICATION_JOURNAL    = 4; // "Journal", 
const PUBLICATION_URL        = 5; // "<more info url>",
const PUBLICATION_ISSUE_DATE = 6; // "<issued unix timestamp>", 
const PUBLICATION_SUMMARY    = 7; // "<PUBLICATION summary>"

function publicationObj(index, tag) {
    return {
        id: index,
        doi: tag[PUBLICATION_DOI],
        title: tag[PUBLICATION_TITLE],
        authors: tag[PUBLICATION_AUTHORS],
        journal: tag[PUBLICATION_JOURNAL],
        url: tag[PUBLICATION_URL],
        issueDate: parseUnixtimestamp(tag[PUBLICATION_ISSUE_DATE]),
        summary: tag[PUBLICATION_SUMMARY]
    }
}

function sortPublications(array) {
    return array.sort((a, b) => {
        if (a.issueDate > b.issueDate) {
            return -1
        } else if (a.issueDate < b.issueDate) {
            return 1
        }

        return 0
    })
}

function convertToPublicationAndSort(indexedTagMap) {
    let result = []
    indexedTagMap.forEach((value, key) => {
        result.push(publicationObj(key, value))
    })
    return sortPublications(result)
}

function createPublicationWithName(event, publicationTitle) {
    return [
        "j", 
        "DOI", 
        publicationTitle, 
        "",
        "Journal",
        "",
        "", 
        "", 
        ""
    ];
}