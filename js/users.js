/* =====================================
   FINAL USERS.JS
===================================== */

let usersData = [];
let selectedUser = null;

/* =====================================
   CONFIG
===================================== */

/*const GAS_URL =
'https://script.google.com/macros/s/AKfycbwZiv7WCHXKe_Rk8Hwy28IeOyrBRGT6Qg46LvRkFXuxNG9bpodru_gKxtor8UYyQkpS/exec';*?

/* =====================================
   LOAD USERS
===================================== */

async function loadUsers(){

    try{

        const response =
            await fetch(
                `${GAS_URL}?action=getUsers`
            );

        const data =
            await response.json();

        usersData = data;

        renderUsers(data);

    }
    catch(error){

        console.error(error);

    }

}

/* =====================================
   RENDER USERS
===================================== */

function renderUsers(data){

    const tbody =
        document.querySelector(
            '#usersTable tbody'
        );

    if(!tbody)
        return;

    tbody.innerHTML = '';

    data.forEach(user => {

        tbody.innerHTML += `

        <tr>

            <td>${user.username}</td>

            <td>${user.name}</td>

            <td>${user.role}</td>

            <td>${user.status}</td>

            <td>

                <button
                    onclick="editUser('${user.username}')"
                    class="btn edit">

                    Edit

                </button>

                <button
                    onclick="toggleUser('${user.username}')"
                    class="btn view">

                    Status

                </button>

                <button
                    onclick="deleteUser('${user.username}')"
                    class="btn delete">

                    Padam

                </button>

            </td>

        </tr>

        `;

    });

}

/* =====================================
   SEARCH
===================================== */

function searchUsers(){

    const keyword =
        document
        .getElementById(
            'userSearch'
        )
        .value
        .toLowerCase();

    const filtered =
        usersData.filter(user =>

            user.username
            .toLowerCase()
            .includes(keyword)

            ||

            user.name
            .toLowerCase()
            .includes(keyword)

        );

    renderUsers(filtered);

}

/* =====================================
   OPEN ADD USER
===================================== */

function openUserModal(){

    selectedUser = null;

    document
        .getElementById(
            'userModal'
        )
        .classList
        .remove(
            'hidden'
        );

}

/* =====================================
   CLOSE MODAL
===================================== */

function closeUserModal(){

    document
        .getElementById(
            'userModal'
        )
        .classList
        .add(
            'hidden'
        );

}

/* =====================================
   SAVE USER
===================================== */

async function saveUser(){

    const payload = {

        action:
            'addUser',

        username:
            document
            .getElementById(
                'usernameInput'
            )
            .value,

        password:
            document
            .getElementById(
                'passwordInput'
            )
            .value,

        name:
            document
            .getElementById(
                'nameInput'
            )
            .value,

        role:
            document
            .getElementById(
                'roleInput'
            )
            .value

    };

    try{

        const response =
            await fetch(
                GAS_URL,
                {
                    method:'POST',
                    body:JSON.stringify(
                        payload
                    )
                }
            );

        const result =
            await response.json();

        alert(
            result.message ||
            'Pengguna berjaya disimpan.'
        );

        closeUserModal();

        loadUsers();

    }
    catch(error){

        console.error(error);

    }

}

/* =====================================
   EDIT USER
===================================== */

function editUser(username){

    const user =
        usersData.find(

            x =>
            x.username ===
            username

        );

    if(!user)
        return;

    selectedUser =
        username;

    document
        .getElementById(
            'usernameInput'
        )
        .value =
        user.username;

    document
        .getElementById(
            'nameInput'
        )
        .value =
        user.name;

    document
        .getElementById(
            'roleInput'
        )
        .value =
        user.role;

    openUserModal();

}

/* =====================================
   DELETE USER
===================================== */

async function deleteUser(username){

    if(
        !confirm(
            'Padam pengguna ini?'
        )
    )
        return;

    try{

        const response =
            await fetch(
                GAS_URL,
                {
                    method:'POST',
                    body:JSON.stringify({

                        action:
                            'deleteUser',

                        username:
                            username

                    })
                }
            );

        const result =
            await response.json();

        alert(
            result.message ||
            'Pengguna dipadam.'
        );

        loadUsers();

    }
    catch(error){

        console.error(error);

    }

}

/* =====================================
   TOGGLE STATUS
===================================== */

async function toggleUser(username){

    try{

        const response =
            await fetch(
                GAS_URL,
                {
                    method:'POST',
                    body:JSON.stringify({

                        action:
                            'toggleUser',

                        username:
                            username

                    })
                }
            );

        const result =
            await response.json();

        alert(
            result.message ||
            'Status dikemaskini.'
        );

        loadUsers();

    }
    catch(error){

        console.error(error);

    }

}

/* =====================================
   RESET PASSWORD
===================================== */

async function resetPassword(username){

    try{

        const response =
            await fetch(
                GAS_URL,
                {
                    method:'POST',
                    body:JSON.stringify({

                        action:
                            'resetPassword',

                        username:
                            username

                    })
                }
            );

        const result =
            await response.json();

        alert(
            result.message ||
            'Password direset.'
        );

    }
    catch(error){

        console.error(error);

    }

}

/* =====================================
   INIT
===================================== */

document.addEventListener(

    'DOMContentLoaded',

    function(){

        if(
            document.getElementById(
                'usersTable'
            )
        ){

            loadUsers();

        }

    }

);
