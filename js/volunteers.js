const VOLUNTEER_TAGNAME    = 0; // "s", // education / courses
const VOLUNTEER_PUBKEY     = 1; // "<VOLUNTEER's public key>",  // can be blank if not on Nostr yet.
const VOLUNTEER_NAME       = 2; // "<VOLUNTEER name>", 
const VOLUNTEER_LOCATION   = 3; // "<city>, <state>, <country>", 
const VOLUNTEER_URL        = 4; // "<more info url>",
const VOLUNTEER_POSITION   = 5; // "<position>", 
const VOLUNTEER_START      = 6; // "<start unix timestamp>", 
const VOLUNTEER_END        = 7; // "<end unix timestamp>", // blank if currently studying there.
const VOLUNTEER_SUMMARY    = 8; // "<volunteer summary>"

function volunteerObj(index, tag) {
    return {
        id: index,
        pubkey: tag[VOLUNTEER_PUBKEY],
        name: tag[VOLUNTEER_NAME],
        location: tag[VOLUNTEER_LOCATION],
        url: tag[VOLUNTEER_URL],
        position: tag[VOLUNTEER_POSITION],
        start: parseUnixtimestamp(tag[VOLUNTEER_START]),
        end: parseUnixtimestamp(tag[VOLUNTEER_END]),
        summary: tag[VOLUNTEER_SUMMARY]
    }
}

function sortVolunteers(array) {
    return array.sort((a, b) => {
        if (!a.end && b.end) {
            return -1
        } else if (a.end && !b.end) {
            return 1
        }

        if (a.end > b.end) {
            return -1
        } else if (a.end < b.end) {
            return 1
        }

        if (!a.start && b.start) {
            return -1
        } else if (a.start && !b.start) {
            return 1
        }

        if (a.start > b.start) {
            return -1
        } else if (a.start < b.start) {
            return 1
        }

        return 0
    })
}

function convertToVolunteerAndSort(indexedTagMap) {
    let result = []
    indexedTagMap.forEach((value, key) => {
        result.push(volunteerObj(key, value))
    })
    return sortVolunteers(result)
}

function createVolunteerWithName(event, volunteerName) {
    return [
        "v", 
        "", 
        volunteerName, 
        "<city>, <state>, <country>",
        "",
        "Position",
        "", 
        "", 
        "", 
        "",
        ""
    ];
}