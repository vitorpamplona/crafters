const PATENT_TAGNAME    = 0; // "n", // education / courses
const PATENT_NUMBER     = 1; // "<PATENT's public key>",  // can be blank if not on Nostr yet.
const PATENT_TITLE      = 2; // "<PATENT title>", 
const PATENT_AUTHORS    = 3; // "Authors", 
const PATENT_URL        = 4; // "<more info url>",
const PATENT_STATUS     = 5; // "<title>", 
const PATENT_ISSUE_DATE = 6; // "<issued unix timestamp>", 
const PATENT_SUMMARY    = 7; // "<PATENT summary>"

function patentObj(index, tag) {
    return {
        id: index,
        number: tag[PATENT_NUMBER],
        title: tag[PATENT_TITLE],
        authors: tag[PATENT_AUTHORS],
        url: tag[PATENT_URL],
        status: tag[PATENT_STATUS],
        issueDate: parseUnixtimestamp(tag[PATENT_ISSUE_DATE]),
        summary: tag[PATENT_SUMMARY]
    }
}

function sortPatents(array) {
    return array.sort((a, b) => {
        if (!a.issueDate && b.issueDate) {
            return -1
        } else if (a.issueDate && !b.issueDate) {
            return 1
        }

        if (a.issueDate > b.issueDate) {
            return -1
        } else if (a.issueDate < b.issueDate) {
            return 1
        }

        return 0
    })
}

function convertToPatentAndSort(indexedTagMap) {
    let result = []
    indexedTagMap.forEach((value, key) => {
        result.push(patentObj(key, value))
    })
    return sortPatents(result)
}

function createPatentWithName(event, patentTitle) {
    return [
        "n", 
        "Number", 
        patentTitle, 
        "",
        "",
        "",
        "", 
        "", 
        ""
    ];
}