var pubkey = undefined
var cv = undefined
var userNames = new Map()
var relay = undefined

async function start() {
    const urlParams = new URLSearchParams(window.location.search);

    pubkey = urlParams.get('author')
    if (!pubkey) { 
        pubkey = await window.nostr.getPublicKey() 

        urlParams.set("author", pubkey);
        var newRelativePathQuery = window.location.pathname + '?' + urlParams.toString();
        history.pushState(null, '', newRelativePathQuery);
    }

    relay = await NostrTools.Relay.connect('wss://nostr.mom')

    // let's query for an event that exists
    const sub = relay.subscribe([{
        authors: [pubkey],
        kinds: [0, 11000]
    }], {
        onevent(event) {
            if (event.kind == 0) {
                console.log(JSON.parse(event.content))
                userNames.set(event.pubkey, JSON.parse(event.content))
                updateCVScreen()
            } else if (event.kind == 11000) {
                cv = event
                updateCVScreen()
            }
        },
        oneose() {
            sub.close()
        }
    })
}

function replaceTag(event, tagName, tagValue) {
    let newTags = [["alt", "A resume"]]
    if (event) {
        newTags = event.tags.filter(it => it[0] != tagName)
    }
    newTags.push([tagName, tagValue])
    return newTags
}

function deleteTagFrom(event, tagName, fromTagValue) {
    let newTags = [["alt", "A resume"]]
    if (event) {
        newTags = event.tags.filter(it => !(it[0] === tagName && it[1] === fromTagValue))
    }
    return newTags
}

function deleteTagFrom2(event, tagName, index) {
    let newTags = [["alt", "A resume"]]
    if (event) {
        newTags = [...event.tags]
        newTags.splice(index, 1)
    }
    return newTags
}

function replaceTagFromTo(event, tagName, fromTagValue, toTagValue) {
    let newTags = [["alt", "A resume"]]
    if (event) {
        newTags = [...event.tags]
        let pos = newTags.findIndex(it => (it[0] === tagName && it[1] === fromTagValue))
        newTags[pos] = [tagName, toTagValue]
    }
    return newTags
}

function changeTag(event, tagName, tagIndex, posInTag, toTagValue) {
    let newTags = [["alt", "A resume"]]
    if (event) {
        newTags = [...event.tags]
        newTags[tagIndex][posInTag] = toTagValue
    }
    return newTags
}

async function updateFromTo(event, tagName, fromTagValue, toTagValue) {
    console.log("Update", tagName, "from" , fromTagValue, "to", toTagValue)
    signBroadcastAndUpdateScreen(replaceTagFromTo(event, tagName, fromTagValue, toTagValue))
}

async function update(event, tagName, tagValue) {
    console.log("Update", tagName, "to" , tagValue)
    signBroadcastAndUpdateScreen(replaceTag(event, tagName, tagValue))
}

async function updatePositional(event, tagName, tagIndex, pos, tagValue) {
    console.log("Update", tagName, "to" , tagValue)
    signBroadcastAndUpdateScreen(changeTag(event, tagName, tagIndex, pos, tagValue))
}

async function deleteTag(event, tagName, fromValue) {   
    console.log("Delete", tagName, "equals to" , fromValue)
    signBroadcastAndUpdateScreen(deleteTagFrom(event, tagName, fromValue))
}

async function deleteTag2(event, tagName, tagIndex) {   
    console.log("Delete", tagName, "on index" , tagIndex)
    signBroadcastAndUpdateScreen(deleteTagFrom2(event, tagName, tagIndex))
}

async function addTagArray(event, tagArray) {
    let tags = [...event.tags]
    if (tagArray) {
        tags.push(tagArray)
    }

    signBroadcastAndUpdateScreen(tags)
}

async function add(event, tagName, tagValue) {
    await addTagArray(event, [tagName, tagValue])
}

async function signBroadcastAndUpdateScreen(tags) {
    let eventTemplate = {
        kind: 11000,
        content: "",
        tags: tags,
        created_at: Math.floor(Date.now() / 1000)
    }

    console.log("Signing", eventTemplate)

    let signedEvent = await window.nostr.signEvent(eventTemplate)
    if (relay) {
        await relay.publish(signedEvent)
    }
    cv = signedEvent
    updateCVScreen()
}

function getFromCV(cvProp, defaultValue) {
    if (cv) {
        let tag = cv.tags.find(it => it[0] == cvProp)
        if (tag && tag.length > 1 && tag[1]) return tag[1]
    }
    return defaultValue
}

function filterFromCV(cvProp) {
    return cv.tags.filter(it => it[0] == cvProp)
}

function filterFromCVToIndexMap(cvProp) {
    let result = new Map()

    cv.tags.forEach((value, index) => {
        if (value[0] == cvProp) {
            result.set(index, value)
        }
    }) 
    return result
}

function getMetadataOrCV(metaProp, cvProp, defaultValue) {
    if (cv) {
        let tag = cv.tags.find(it => it[0] == cvProp)
        if (tag && tag.length > 1 && tag[1]) return tag[1]
    }
    author = userNames.get(pubkey)
    if (author && author[metaProp]) return author[metaProp]
    return defaultValue
} 

function getName() { return getMetadataOrCV("name", "name", "Your name here") }
function getEmail() { return getMetadataOrCV("email", "email", "you@yoursite.com") }
function getWebsite() { return getMetadataOrCV("website", "website", "http://yoursite.com") }
function getLocation() { return getFromCV("location", "Cite, State, Country") }
function getSummary() { return getFromCV("summary", "Describe why you fit this role") }
function getInterests() { return filterFromCV("t") }
function getSkills() { return filterFromCV("l") }
function getLanguages() { return filterFromCV("u") }
function getSchools() { return convertToSchoolAndSort(filterFromCVToIndexMap("s")) }
function getWorks() { return convertToWorkAndSort(filterFromCVToIndexMap("w")) }
function getAwards() { return convertToAwardAndSort(filterFromCVToIndexMap("h")) }
function getPatents() { return convertToPatentAndSort(filterFromCVToIndexMap("n")) }
function getPublications() { return convertToPublicationAndSort(filterFromCVToIndexMap("j")) }
function getVolunteering() { return convertToVolunteerAndSort(filterFromCVToIndexMap("v")) }

// UI
function updateListSection(listName, list, tagName) {
    let id = listName.replace("#", "")
    let section = $(listName)
    section.html("")
    list.forEach((item, index) => {
        $('<li></li>').attr({ 'id': id+index }).text(item[1]).appendTo(section)

        initEditorFromTo(listName+index, ()=> item[1], tagName)
        initDelete(listName+index, listName+index, () => deleteTag(cv, tagName, item[1]))
    })
}

function updateSchoolSection(listName, list, tagName) {
    /**
    <div class="section-text-full">
        <h3><span class="emph">Master of Science</span> in Computer Science</h3>
        <div>New York University, Courant Institute of Mathematical Science</div>
        <div class="row">
            <div class="col light">New York, USA</div>
            <div class="col-right light">September 2013 - May 2015</div>
        </div>
    </div>
     */

    let id = listName.replace("#", "")
    let section = $(listName)
    section.html("")
    list.forEach((school, index) => {
        let div = $('<div></div>')
        div.attr({ 'class': "section-text-full", 'id': id+index }).appendTo(section)

        let h3 = $('<h3></h3>')
        h3.attr({ 'id': id+index+"title" })

        let spanDegree = $('<span></span>')
        spanDegree.attr({ 'class': "emph", 'id': id+index+"degree" })
        spanDegree.text(school.degree)
        spanDegree.appendTo(h3)

        h3.append(" in ")

        let spanField = $('<span></span>')
        spanField.attr({ 'id': id+index+"field" })
        spanField.text(school.field)
        spanField.appendTo(h3)

        h3.appendTo(div)

        let schoolName = $('<div></div>')
        schoolName.attr({ 'id': id+index+"name" })
        schoolName.text(school.name)
        schoolName.appendTo(div)

        let loc = $('<div></div>').attr({ 'class': "row" })

        let schoolLocation = $('<div></div>').attr({ 'class': "col light", 'id': id+index+"location" })
        schoolLocation.text(school.location)
        schoolLocation.appendTo(loc)

        let schoolStartEnd = $('<div></div>').attr({ 'class': "col-right light" })
        
        let spanStart = $('<span></span>').attr({ 'id': id+index+"start" })
        spanStart.text(formatDate(school.start))

        let spanEnd = $('<span></span>').attr({ 'id': id+index+"end" })
        spanEnd.text(formatDate(school.end))

        schoolStartEnd.append(spanStart).append(" - ").append(spanEnd)

        schoolStartEnd.appendTo(loc)

        loc.appendTo(div)

        div.appendTo(section)

        initEditorPosition(listName+index+"degree", ()=> school.degree, tagName, school.id, SCHOOL_DEGREE)
        initEditorPosition(listName+index+"field", ()=> school.field, tagName, school.id, SCHOOL_FIELD)
        initEditorPosition(listName+index+"name", ()=> school.name, tagName, school.id, SCHOOL_NAME)
        initEditorPosition(listName+index+"location", ()=> school.location, tagName, school.id, SCHOOL_LOCATION)
        initDateEditorPosition(listName+index+"start", ()=> formatDateToInput(school.start), tagName, school.id, SCHOOL_START)
        initDateEditorPosition(listName+index+"end", ()=> formatDateToInput(school.end), tagName, school.id, SCHOOL_END)
        initDelete(listName+index, listName+index+"title", () => deleteTag2(cv, tagName, school.id))
    })
}

function updateWorkSection(listName, list, tagName) {
    /**
    <div class="section-text-full">
        <h3>Google</h3>
        <div class="row subsection">
            <div class="emph col">Full stack engineer</div>
            <div class="col-right light">July 2015 - Present</div>
        </div>
        <ul class="desc">
            <li>YouTube Heroes</li>
            <li>YouTube Trust and Safety Community Platform</li>
        </ul>
    </div>
     */

    let id = listName.replace("#", "")
    let section = $(listName)
    section.html("")
    list.forEach((work, index) => {
        let div = $('<div></div>')
        div.attr({ 'class': "section-text-full", 'id': id+index }).appendTo(section)

        let h3 = $('<h3></h3>')
        h3.attr({ 'id': id+index+"jobTitle" })
        h3.text(work.jobTitle)
        h3.appendTo(div)

        let workName = $('<div></div>')
        workName.attr({ 'id': id+index+"name" })
        workName.text(work.name)
        workName.appendTo(div)

        let subsection = $('<div></div>')
        subsection.attr({ 'class': "row" })

        let schoolLocation = $('<div></div>').attr({ 'class': "col light", 'id': id+index+"location" })
        schoolLocation.text(work.location)
        schoolLocation.appendTo(subsection)

        let workStartEnd = $('<div></div>').attr({ 'class': "col-right light" })
        
        let spanStart = $('<span></span>').attr({ 'id': id+index+"start" })
        spanStart.text(formatDate(work.start))

        let spanEnd = $('<span></span>').attr({ 'id': id+index+"end" })
        spanEnd.text(formatDate(work.end))

        workStartEnd.append(spanStart).append(" - ").append(spanEnd)
        workStartEnd.appendTo(subsection)

        subsection.appendTo(div)

        div.appendTo(section)

        initEditorPosition(listName+index+"jobTitle", ()=> work.jobTitle, tagName, work.id, WORK_JOB_TITLE)
        initEditorPosition(listName+index+"name", ()=> work.name, tagName, work.id, WORK_NAME)
        initEditorPosition(listName+index+"location", ()=> work.location, tagName, work.id, WORK_LOCATION)
        initDateEditorPosition(listName+index+"start", ()=> formatDateToInput(work.start), tagName, work.id, WORK_START)
        initDateEditorPosition(listName+index+"end", ()=> formatDateToInput(work.end), tagName, work.id, WORK_END)
        initDelete(listName+index, listName+index+"jobTitle", () => deleteTag2(cv, tagName, work.id))
    })
}


function updateAwardSection(listName, list, tagName) {
    let id = listName.replace("#", "")
    let section = $(listName)
    section.html("")
    list.forEach((award, index) => {
        let div = $('<div></div>')
        div.attr({ 'class': "section-text-full", 'id': id+index })

        let awardIssueDate = $('<span></span>').attr({ 'id': id+index+"issueDate" })
        awardIssueDate.text(formatYear(award.issueDate))
        awardIssueDate.appendTo(div)

        div.append(" - ")

        let awardTitle = $('<span></span>').attr({ 'id': id+index+"title" })
        awardTitle.text(award.title)
        awardTitle.appendTo(div)

        div.append(" - ")

        let awardName = $('<span></span>').attr({ 'id': id+index+"name" })
        awardName.text(award.name)
        awardName.appendTo(div)

        div.appendTo(section)

        initEditorPosition(listName+index+"title", ()=> award.title, tagName, award.id, AWARD_TITLE)
        initEditorPosition(listName+index+"name", ()=> award.name, tagName, award.id, AWARD_NAME)
        initDateEditorPosition(listName+index+"issueDate", ()=> formatDateToInput(award.issueDate), tagName, award.id, AWARD_ISSUE_DATE)
        initDelete(listName+index, listName+index, () => deleteTag2(cv, tagName, award.id))
    })
}

function updatePatentSection(listName, list, tagName) {
    let id = listName.replace("#", "")
    let section = $(listName)
    section.html("")
    list.forEach((patent, index) => {
        let div = $('<div></div>')
        div.attr({ 'class': "section-text-full", 'id': id+index })

        let patentIssueDate = $('<span></span>').attr({ 'id': id+index+"issueDate" })
        patentIssueDate.text(formatYear(patent.issueDate))
        patentIssueDate.appendTo(div)

        div.append(" - ")

        let patentNumber = $('<span></span>').attr({ 'id': id+index+"number" })
        patentNumber.text(patent.number)
        patentNumber.appendTo(div)

        div.append(" - ")

        let patentTitle = $('<span></span>').attr({ 'id': id+index+"title" })
        patentTitle.text(patent.title)
        patentTitle.appendTo(div)

        div.appendTo(section)

        initEditorPosition(listName+index+"number", ()=> patent.number, tagName, patent.id, PATENT_NUMBER)
        initEditorPosition(listName+index+"title", ()=> patent.title, tagName, patent.id, PATENT_TITLE)
        initDateEditorPosition(listName+index+"issueDate", ()=> formatDateToInput(patent.issueDate), tagName, patent.id, PATENT_ISSUE_DATE)
        initDelete(listName+index, listName+index, () => deleteTag2(cv, tagName, patent.id))
    })
}

function updatePublicationSection(listName, list, tagName) {
    let id = listName.replace("#", "")
    let section = $(listName)
    section.html("")
    list.forEach((publication, index) => {
        let div = $('<div></div>')
        div.attr({ 'class': "section-text-full", 'id': id+index })

        let publicationIssueDate = $('<span></span>').attr({ 'id': id+index+"issueDate" })
        publicationIssueDate.text(formatYear(publication.issueDate))
        publicationIssueDate.appendTo(div)

        div.append(" - ")

        let publicationTitle = $('<span></span>').attr({ 'id': id+index+"title" })
        publicationTitle.text(publication.title)
        publicationTitle.appendTo(div)

        div.append(" - ")

        let publicationJournal = $('<span></span>').attr({ 'id': id+index+"journal" })
        publicationJournal.text(publication.journal)
        publicationJournal.appendTo(div)

        div.appendTo(section)

        initEditorPosition(listName+index+"title", ()=> publication.title, tagName, publication.id, PUBLICATION_TITLE)
        initEditorPosition(listName+index+"journal", ()=> publication.journal, tagName, publication.id, PUBLICATION_JOURNAL)
        initDateEditorPosition(listName+index+"issueDate", ()=> formatDateToInput(publication.issueDate), tagName, publication.id, PUBLICATION_ISSUE_DATE)
        initDelete(listName+index, listName+index, () => deleteTag2(cv, tagName, publication.id))
    })
}

function updateVolunteerSection(listName, list, tagName) {
    let id = listName.replace("#", "")
    let section = $(listName)
    section.html("")
    list.forEach((volunteer, index) => {
        let div = $('<div></div>')
        div.attr({ 'class': "section-text-full", 'id': id+index })

        let volunteerStartEnd = $('<span></span>').attr({ 'id': id+index+"issueDate" })

        let spanStart = $('<span></span>').attr({ 'id': id+index+"start" })
        spanStart.text(formatYear(volunteer.start))
        spanStart.appendTo(volunteerStartEnd)

        volunteerStartEnd.append(" - ")

        let spanEnd = $('<span></span>').attr({ 'id': id+index+"end" })
        spanEnd.text(formatYear(volunteer.end))
        spanEnd.appendTo(volunteerStartEnd)

        volunteerStartEnd.appendTo(div)

        div.append(": ")

        let volunteerPosition = $('<span></span>').attr({ 'id': id+index+"position" })
        volunteerPosition.text(volunteer.position)
        volunteerPosition.appendTo(div)

        div.append(", ")

        let volunteerOrg = $('<span></span>').attr({ 'id': id+index+"name" })
        volunteerOrg.text(volunteer.name)
        volunteerOrg.appendTo(div)

        div.appendTo(section)

        initEditorPosition(listName+index+"position", ()=> volunteer.position, tagName, volunteer.id, VOLUNTEER_POSITION)
        initEditorPosition(listName+index+"name", ()=> volunteer.name, tagName, volunteer.id, VOLUNTEER_NAME)
        initDateEditorPosition(listName+index+"start", ()=> formatDateToInput(volunteer.start), tagName, volunteer.id, VOLUNTEER_START)
        initDateEditorPosition(listName+index+"end", ()=> formatDateToInput(volunteer.end), tagName, volunteer.id, VOLUNTEER_END)
        initDelete(listName+index, listName+index, () => deleteTag2(cv, tagName, volunteer.id))
    })
}

async function updateCVScreen() {
    author = userNames.get(pubkey)

    $("#name").text(getName())
    $("#email").html(getEmail())
    $("#website").html(getWebsite().replace("http://","").replace("https://",""))
    $("#location").text(getLocation())
    $("#summary").text(getSummary())

    updateListSection("#interests",getInterests(), "t")
    updateListSection("#skills", getSkills(), "l")
    updateListSection("#languages", getLanguages(), "u")

    updateSchoolSection("#schools", getSchools(), "s")
    updateWorkSection("#works", getWorks(), "w")
    updateAwardSection("#awards", getAwards(), "h")
    updatePatentSection("#patents", getPatents(), "n")
    updatePublicationSection("#publications", getPublications(), "j")
    updateVolunteerSection("#volunteering", getVolunteering(), "v")
}

function initEditorFromTo(id, getValueFn, cvTag) {
    $(id).on("click", (ev) => { toggleTextEdit(ev, () => getValueFn(), (newValue) => updateFromTo(cv, cvTag, getValueFn(), newValue)) })
    $(id).addClass("edit-marker")
}

function initEditorPosition(id, getValueFn, cvTag, tagIndex, pos) {
    $(id).on("click", (ev) => { toggleTextEdit(ev, () => getValueFn(), (newValue) => updatePositional(cv, cvTag, tagIndex, pos, newValue)) })
    $(id).addClass("edit-marker")
}

function initDateEditorPosition(id, getValueFn, cvTag, tagIndex, pos) {
    $(id).on("click", (ev) => { toggleDateTextEdit(ev, () => getValueFn(), (newValue) => updatePositional(cv, cvTag, tagIndex, pos, newValue)) })
    $(id).addClass("edit-marker")
}

function initEditor(id, getValueFn, cvTag) {
    $(id).on("click", (ev) => { toggleTextEdit(ev, () => getValueFn(), (newValue) => update(cv, cvTag, newValue)) })
    $(id).addClass("edit-marker")
}

function initAreaEditor(id, getValueFn, cvTag) {
    $(id).on("click", (ev) => { toggleTextArea(ev, () => getValueFn(), (newValue) => update(cv, cvTag, newValue)) })
    $(id).addClass("edit-marker")
}

async function initEditors() {
    initEditor("#name", getName, "name")
    initEditor("#email", getEmail, "email")
    initEditor("#website", getWebsite, "website")
    initEditor("#location", getLocation, "location")

    initAreaEditor("#summary", getSummary, "summary")
    initAdd("#interests-hover-base", "#interests-add-host", (newValue) => add(cv, "t", newValue), "new interest")
    initAdd("#skills-hover-base", "#skills-add-host", (newValue) => add(cv, "l", newValue), "new skill")
    
    initAdd("#education-hover-base", "#education-add-host", (newValue) => addTagArray(cv, createSchoolWithName(cv, newValue)), "new college")
    initAdd("#work-hover-base", "#work-add-host", (newValue) => addTagArray(cv, createWorkWithName(cv, newValue)), "new work experience")
    initAdd("#awards-hover-base", "#awards-add-host", (newValue) => addTagArray(cv, createAwardWithName(cv, newValue)), "new award, honour or certification")
    initAdd("#patents-hover-base", "#patents-add-host", (newValue) => addTagArray(cv, createPatentWithName(cv, newValue)), "new patent title")
    initAdd("#publications-hover-base", "#publications-add-host", (newValue) => addTagArray(cv, createPublicationWithName(cv, newValue)), "new publication title")

    initAdd("#languages-hover-base", "#languages-add-host", (newValue) => add(cv, "u", newValue), "new language")

    initAdd("#volunteering-hover-base", "#volunteering-add-host", (newValue) => addTagArray(cv, createVolunteerWithName(cv, newValue)), "new volunteer")
}

$(document).ready(function () {
    initEditors()
    start()
});
