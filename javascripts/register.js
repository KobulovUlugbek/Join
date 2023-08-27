let remoteUserssAsJSON;
let newUser;


/**
 * Registers a new user by adding their information to the remote users' data.
 * Clears the registration form after registration and redirects to the login page.
 * @returns {Promise<void>} - A Promise that resolves after the registration process is complete.
 */
async function register() {
  /* registerBtn.disabled = true; */

    /**
     * Represents the remote user data fetched from storage.
     * @type {Array<object>}
     */
    let res = await getItem("usersRemote");
    remoteUserssAsJSON = await JSON.parse(res.data.value.replace(/'/g, '"'));

        /**
     * Represents the input field for the user's name during registration.
     * @type {HTMLInputElement}
     */
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

   /**
     * Redirects the user to the login page after successful registration.
     */
   window.location.href = "login.html";

   /* registerBtn.disabled = false; */
}