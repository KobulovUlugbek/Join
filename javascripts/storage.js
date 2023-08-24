let contacts = [{
        name: "Nicole",
        color: "#0223CF",
        email: "nicole@gmail.com",
        phone: "+49 12345678",
    },
    {
        name: "Beck",
        color: "#CB02CF",
        email: "beck@hotmail",
        phone: "+49 12345678",
    },
    {
        name: "Beck Beck",
        color: "#CB02CF",
        email: "beck@hotmail",
        phone: "+49 12345678",
    }
];

let tasks = [{
        title: "Call potential clients",
        description: "Make the product presentation to prospective buyers",
        status: "todo",
        category: "sales",
        priority: "urgent",
        subtasks: [
            { name: "Follow up with leads", status: "inProgress" },
            { name: "Schedule product demos", status: "done" }
        ],
        dueDate: "2022-08-15",
        assignedTo: [contacts[0], contacts[2], contacts[3]],
    },
    {
        title: "Organize Financial Records",
        description: "Review and organize financial records, including invoices, receipts, and expense reports, to ensure accurate bookkeeping and easy retrieval for auditing purposes",
        status: "todo",
        category: "backoffice",
        priority: "urgent",
        subtasks: [
            { name: "Sort and file invoices", status: "inProgress" },
            { name: "Create expense reports", status: "inProgress" }
        ],
        dueDate: "2022-08-16",
        assignedTo: [contacts[6], contacts[4], contacts[8]],
    },
    {
        title: "Update website design",
        description: "Revamp the existing website design to improve user experience and align with the latest design trends. Enhance visual aesthetics, optimize page load speed, and ensure responsiveness across different devices and screen sizes.",
        status: "inProgress",
        category: "design",
        priority: "medium",
        subtasks: [
            { name: "Conduct user testing", status: "done" },
            { name: "Optimize site navigation", status: "inProgress" }
        ],
        dueDate: "2022-06-30",
        assignedTo: [contacts[1], contacts[4], contacts[5]],
    },
    {
        title: "Review project proposal",
        description: "Thoroughly review the project proposal and provide feedback on its feasibility, strategic alignment, and potential impact. Assess the proposed budget, timeline, and resource allocation. Identify any areas of improvement or concerns and communicate them to the project team.",
        status: "awaitingFeedback",
        category: "marketing",
        priority: "low",
        subtasks: [
            { name: "Analyze cost-benefit ratio", status: "done" },
            { name: "Evaluate risks and contingencies", status: "inProgress" }
        ],
        dueDate: "2022-07-15",
        assignedTo: [contacts[6], contacts[7], contacts[8]],
    },
    {
        title: "Prepare quarterly report",
        description: "Compile financial data and analysis to create a comprehensive quarterly report for the management team. Include key performance indicators, budget analysis, and recommendations for improvement.",
        status: "done",
        category: "backoffice",
        priority: "urgent",
        subtasks: [
            { name: "Analyze revenue trends", status: "done" },
            { name: "Summarize expenditure breakdown", status: "done" }
        ],
        dueDate: "2022-04-30",
        assignedTo: [contacts[7], contacts[8], contacts[9]],
    },
];


let categories = [{
        name: "sales",
        color: "#FC71FF",
    },
    {
        name: "backoffice",
        color: "#1FD7C1",
    },
    {
        name: "marketing",
        color: "#0038FF",
    },
    {
        name: "design",
        color: "#FF7A00",
    },
    {
        name: "media",
        color: "#FF0000",
    },
];

/* ***************************************************************** */

function getInitials(name) {
    let initials = "";
    let splitted_name = name.split(" ");

    if (splitted_name.length > 0 && splitted_name[0].length > 0) {
        initials += splitted_name[0].charAt(0);
    }

    if (splitted_name.length > 1 && splitted_name[1].length > 0) {
        initials += splitted_name[1].charAt(0);
    }
    return initials;
}

/* ****************************************************************+ */

/* Token Generator: https://remote-storage.developerakademie.org/token-generator */

const STORAGE_TOKEN = "HT0S0N13Y0K6B2YIWFIVXQ2L8P2T85JJ2LNGCLH0";
const STORAGE_URL = "https://remote-storage.developerakademie.org/item";

async function setItem(key, value) {
    // ("contactsRemote", contacts) or ("tasksRemote", tasks)  or ("currentUserName", nameAsObject)
    const payload = { key, value, token: STORAGE_TOKEN };
    return fetch(STORAGE_URL, { method: "POST", body: JSON.stringify(payload) }).then((res) =>
        res.json()
    ); // response converted to JSON
}

async function getItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    let erg = await fetch(url).then((res) => res.json());
    return erg; // Thus one can store erg in a variable
}