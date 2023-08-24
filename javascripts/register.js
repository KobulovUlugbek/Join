let remoteUserssAsJSON;
let newUser;

async function register() {
    /* registerBtn.disabled = true; */

    let res = await getItem("usersRemote");
    remoteUserssAsJSON = await JSON.parse(res.data.value.replace(/'/g, '"'));

    let signupName = document.getElementById("signupName");
    let signupEmail = document.getElementById("signupEmail");
    let signupPassword = document.getElementById("signupPassword");
    newUser = {
        'name': signupName.value,
        'email': signupEmail.value,
        'password': signupPassword.value
    };

    remoteUserssAsJSON.push(newUser);
    await setItem('usersRemote', remoteUserssAsJSON)

    signupName.value = '';
    signupEmail.value = '';
    signupPassword.value = '';

    window.location.href = "login.html";

    /* registerBtn.disabled = false; */
}