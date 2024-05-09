const WORK_TAGNAME    = 0; // "s", // education / courses
const WORK_PUBKEY     = 1; // "<WORK's public key>",  // can be blank if not on Nostr yet.
const WORK_NAME       = 2; // "<WORK name>", 
const WORK_LOCATION   = 3; // "<city>, <state>, <country>", 
const WORK_URL        = 4; // "<more info url>",
const WORK_JOB_TITLE  = 5; // "<job title>", 
const WORK_JOB_TYPE   = 6; // "<full-time,part-time>", 
const WORK_PRESENCE   = 7; // "<on-site, hybrid, remote>", 
const WORK_START      = 8; // "<start unix timestamp>", 
const WORK_END        = 9; // "<end unix timestamp>", // blank if currently studying there.
const WORK_SUMMARY    = 10; // "<work summary>"

function workObj(index, tag) {
    return {
        id: index,
        pubkey: tag[WORK_PUBKEY],
        name: tag[WORK_NAME],
        location: tag[WORK_LOCATION],
        url: tag[WORK_URL],
        jobTitle: tag[WORK_JOB_TITLE],
        jobType: tag[WORK_JOB_TYPE],
        presence: tag[WORK_PRESENCE],
        start: parseUnixtimestamp(tag[WORK_START]),
        end: parseUnixtimestamp(tag[WORK_END]),
        summary: tag[WORK_SUMMARY]
    }
}

function sortWorks(array) {
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

function convertToWorkAndSort(indexedTagMap) {
    let result = []
    indexedTagMap.forEach((value, key) => {
        result.push(workObj(key, value))
    })
    return sortWorks(result)
}

function createWorkWithName(event, workName) {
    return [
        "w", 
        "", 
        workName, 
        "<city>, <state>, <country>",
        "",
        "Job Title",
        "", 
        "", 
        "", 
        "",
        ""
    ];
}