const AWARD_TAGNAME    = 0; // "s", // education / courses
const AWARD_PUBKEY     = 1; // "<AWARD's public key>",  // can be blank if not on Nostr yet.
const AWARD_NAME       = 2; // "<AWARD issuer name>", 
const AWARD_LOCATION   = 3; // "<city>, <state>, <country>", 
const AWARD_URL        = 4; // "<more info url>",
const AWARD_TITLE      = 5; // "<title>", 
const AWARD_IMAGE_URL  = 6; // "<image or video url>", 
const AWARD_ISSUE_DATE = 7; // "<issued unix timestamp>", 
const AWARD_SUMMARY    = 8; // "<AWARD summary>"

function awardObj(index, tag) {
    return {
        id: index,
        pubkey: tag[AWARD_PUBKEY],
        name: tag[AWARD_NAME],
        location: tag[AWARD_LOCATION],
        url: tag[AWARD_URL],
        title: tag[AWARD_TITLE],
        image: tag[AWARD_IMAGE_URL],
        issueDate: parseUnixtimestamp(tag[AWARD_ISSUE_DATE]),
        summary: tag[AWARD_SUMMARY]
    }
}

function sortAwards(array) {
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

function convertToAwardAndSort(indexedTagMap) {
    let result = []
    indexedTagMap.forEach((value, key) => {
        result.push(awardObj(key, value))
    })
    return sortAwards(result)
}

function createAwardWithName(event, awardTitle) {
    return [
        "h", 
        "", 
        "Issuer name", 
        "",
        "",
        awardTitle,
        "", 
        "", 
        ""
    ];
}