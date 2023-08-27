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
        name: "Anywhere",
        color: "#CB02CF",
        email: "beck@hotmail",
        phone: "+49 12345678",
    }
];

let tasks = [];


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

/* ****************************************************************+   HT0S0N13Y0K6B2YIWFIVXQ2L8P2T85JJ2LNGCLH0*/

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