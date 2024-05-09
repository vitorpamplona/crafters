const SCHOOL_TAGNAME    = 0; // "s", // education / courses
const SCHOOL_PUBKEY     = 1; // "<school's public key>",  // can be blank if not on Nostr yet.
const SCHOOL_NAME       = 2; // "<school name>", 
const SCHOOL_LOCATION   = 3; // "<city>, <state>, <country>", 
const SCHOOL_URL        = 4; // "<more info url>",
const SCHOOL_DEGREE     = 5; // "<degree>", 
const SCHOOL_FIELD      = 6; // "<field of study>", 
const SCHOOL_GRADE      = 7; // "<grade>", 
const SCHOOL_PRESENCE   = 8; // "<on-site, hybrid, remote>", 
const SCHOOL_START      = 9; // "<start unix timestamp>", 
const SCHOOL_END        = 10; // "<end unix timestamp>", // blank if currently studying there.
const SCHOOL_SUMMARY    = 11; // "<work summary>"

function schoolObj(index, tag) {
    return {
        id: index,
        pubkey: tag[SCHOOL_PUBKEY],
        name: tag[SCHOOL_NAME],
        location: tag[SCHOOL_LOCATION],
        url: tag[SCHOOL_URL],
        degree: tag[SCHOOL_DEGREE],
        field: tag[SCHOOL_FIELD],
        grade: tag[SCHOOL_GRADE],
        presence: tag[SCHOOL_PRESENCE],
        start: parseUnixtimestamp(tag[SCHOOL_START]),
        end: parseUnixtimestamp(tag[SCHOOL_END]),
        summary: tag[SCHOOL_SUMMARY]
    }
}

function sortSchools(array) {
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

function convertToSchoolAndSort(indexedTagMap) {
    let result = []
    indexedTagMap.forEach((value, key) => {
        result.push(schoolObj(key, value))
    })
    return sortSchools(result)
}

function createSchoolWithName(event, schoolName) {
    return [
        "s", 
        "", 
        schoolName, 
        "<city>, <state>, <country>",
        "",
        "Degree",
        "Field of Study", 
        "", 
        "", 
        "",
        "",
        ""
    ]
}
