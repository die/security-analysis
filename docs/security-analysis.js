/* 
    JSON file for storing hardcoded information 
    todo: load from a local json file
*/
let osancJSON = [
    {
        "name": "mod-parse-history",
        "query": "",
    },
    {
        "name": "raid-status-announcements",
        "query": "afk from: 589996847083290629",
    },
    {
        "name": "veri-pending",
        "query": "()",
    },
    {
        "name": "vet-veri-pending",
        "query": "()",
    },
    {
        "name": "mod-mail-review",
        "query": "Response by ()",
    },
    {
        "name": "reception",
        "query": "from: []",
    },
    {
        "name": "mod-cozy-corner",
        "query": "from: []",
    },
    {
        "name": "mod-srsbsns-chat🤬",
        "query": "from: []",
    },
    {
        "name": "warden-war-den",
        "query": "from: []",
    },
    {
        "name": "mod-bot-commands",
        "query": "from: []",
    },
    {
        "name": "mod-logs",
        "query": "[] \n from: []",
        "notes": "The number put on the spreadsheet is the sum of the results of these two queries."
    },
    {
        "name": "oongus-bunker",
        "query": "from: []",
    },
    {
        "name": "staff-updates-log",
        "query": "[]",
        "notes": "Use this query to look for how long they were staff. If nothing shows up, you can put time as staff as the number of days in the month. If they became staff during the month, or went on leave, subtract the days they weren't active staff from the total number of days in the month."
    }
]

let pubhallsJSON = [
    {
        "name": "mod-parse-history",
        "query": "",
    },
    {
        "name": "raid-status-announcements",
        "query": "afk from: 589996847083290629",
    },
    {
        "name": "veri-pending",
        "query": "()",
    },
    {
        "name": "veri-pending-veterans",
        "query": "()",
    },
    {
        "name": "reception",
        "query": "from: []",
    },
    {
        "name": "mod-mail-review",
        "query": "Response by ()",
    },
    {
        "name": "mod-logs",
        "query": "[] \n from: []",
        "notes": "The number put on the spreadsheet is the sum of the results of these two queries."
    },
    {
        "name": "mod-bot-commands",
        "query": "from: []",
    }
]

/* Store staff member information globally */
var staffMembers = []
var json;

/* Initialize elements in the html body that require generated content. */
function load() {
    json = document.getElementById("json").checked ? pubhallsJSON : osancJSON
    document.getElementById("parsesQuery").textContent = getNames(json[0].name) + " " + getDateQuery(true) + " has:file ";
    document.getElementById("rsa").textContent = json[1].query + " " + getNames(json[1].name) + " " + getDateQuery();
}

function getNames(name) {
    let query = "";
    for (let s of name.split(' ')) {
        query += `in: ${s} `
    }
    return query
}

/* Get the discord query for the current month / week */
function getDateQuery(modParseHistory) {
    let before, after, during
    const today = moment.tz(moment(), "America/New_York")
    if (document.getElementById("weekCheckbox").checked) {
        before = today.clone().day() === 0 ? today.clone() : today.clone().subtract(today.clone().day() + 1, 'days')
        after = before.clone().subtract(1, 'weeks').subtract(1, 'day')
        if (modParseHistory) during = moment.tz(before, moment.tz.guess())
    } else {
        before = today.clone().startOf('month');
        after = today.clone().subtract(2, 'months').endOf('month')
    }
    before = moment.tz(before, moment.tz.guess())
    after = moment.tz(after, moment.tz.guess())

    let query = `before: ${getDateFormat(before)} after: ${getDateFormat(after)}`
    if (during) query += ` during: ${getDateFormat(during)}`
    return query
}

function getDateFormat(date) {
    if (!document.getElementById("check").checked) return moment(date).format('YYYY-MM-DD');
    return moment(date).format('YYYY-DD-MM')
}

/* Parse the csv contents pasted in the text box */
function parseCSV(document) { 
    try {
        let text = document.getElementById("parsesTextArea").value.split("\n")
        if (text.length > 0) {
            let header = "Leader ID,Leader Nickname,Currentweek Total,Total"
            for (let i = 0; i < text.length; i++) {
                if (text[i] != header && text[i] != "" && text[i].includes(",")) {
                    let delimit = text[i].split(",")
                    let id = delimit[0]
                    let name = delimit[1];
                    let currentWeekTotal = delimit[2]
                    let rollOverTotal = delimit[3]
                
                    let index = staffMembers.findIndex(staff => staff.name == name)
                    if (index != -1) {
                        staffMembers[index].currentWeekTotal += parseInt(currentWeekTotal)
                        staffMembers[index].rollOverTotal += parseInt(rollOverTotal)
                    } else {
                        let staff = {
                            name: name,
                            id: id,
                            currentWeekTotal: parseInt(currentWeekTotal),
                            rollOverTotal: parseInt(rollOverTotal)
                        }
                        staffMembers.push(staff)
                    }  
                }
            }
            constructStaffTabs()            
        }
    } catch (Exception) {
        console.log(Exception)
    }
}

/* Make tab buttons for all staff inserted */
function constructStaffTabs() {
    /* Sort the list to easily interpret */
    staffMembers.sort((a, b) => a.name.localeCompare(b.name));

    /* Modify Tab */
    let tab = document.getElementById("tab")
    tab.replaceChildren()
    tab.style.display = "block"
    let tabcontent = document.getElementById("tabcontent")
    tabcontent.style.wordWrap = "normal"

    for (let staff of staffMembers) {
        /* Create buttons for each tab */
        var button = document.createElement('button');
        button.className = 'tablinks'
        button.textContent = staff.name
        button.onclick = openTab
        tab.appendChild(button)

        /* Create content for each tab */
        var div = document.createElement('div');
        div.id = staff.name
        div.className = "tabcontent"
        
        /* Name header */
        var h2 = document.createElement('h2');
        h2.textContent = staff.name
        div.appendChild(h2)

        /* Add parses field. */
        var parses = document.createElement('p')
        parses.innerHTML = "Total Parses: " + staff.currentWeekTotal + "<br> Total Parses (includes Rollover): " + staff.rollOverTotal
        div.appendChild(parses)

        /* Go through every query */
        for (let i = 2; i < json.length; i++) {
            /* Add a label for each channel name */
            var label = document.createElement('label');
            label.innerHTML = "<u>" + json[i].name + "</u>"
            div.appendChild(label)
            addNewLine(document, div)

            /* Parse each query and display them. */
            let queries = json[i].query.split("\n")
            for (let j = 0; j < queries.length; j++) {
                var code = document.createElement('code')
                /* () == nickname, [] == id */
                let query = queries[j].replace("[]", staff.id).replace("()", staff.name) + " in: " + json[i].name + " " + getDateQuery()
                code.textContent = query
                div.appendChild(code)
                addNewLine(document, div)
            }
            
            /* If a query has a special note, display it. */
            if (json[i].notes) {
                var p = document.createElement('p')
                p.setAttribute('style', 'white-space: pre-wrap;');
                p.innerHTML = json[i].notes
                div.appendChild(p)
            }
        }   
        tabcontent.appendChild(div)
    }
}

/* Adds a new line to a container. */
function addNewLine(document, div) {
    div.append(document.createElement("br"))
    div.append(document.createElement("br"))
}

/* Logic for handling tabs */
function openTab(evt) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(evt.target.textContent).style.display = "block";
    evt.currentTarget.className += " active";
}
