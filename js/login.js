const GAS_URL =
'https://script.google.com/macros/s/AKfycbwW0zoSC6mgNyMAt_PKKDMUF5HT0UHrPB33J47WxTBRhhYAJoY_OycwqqtOiva5ZdtS/exec';

document
.getElementById(
    'loginForm'
)
.addEventListener(
    'submit',
    login
);

async function login(e){

    e.preventDefault();

    const username =
        document
        .getElementById(
            'username'
        )
        .value
        .trim();

    const password =
        document
        .getElementById(
            'password'
        )
        .value
        .trim();

    try{

        const response =
            await fetch(
                GAS_URL,
                {

                    method:'POST',

                    headers:{
                        'Content-Type':
                        'application/json'
                    },

                    body:
                    JSON.stringify({

                        action:
                        'login',

                        username:
                        username,

                        password:
                        password

                    })

                }
            );

        const result =
            await response.json();

        if(
            result.success
        ){

            localStorage.setItem(

                'hszaUser',

                JSON.stringify({

                    username:
                    result.username,

                    name:
                    result.name,

                    role:
                    result.role

                })

            );

            window.location.href =
                'dashboard.html';

        }
        else{

            showMessage(

                result.message

            );

        }

    }
    catch(error){

        showMessage(
            'Ralat sambungan.'
        );

    }

}

function showMessage(msg){

    document
    .getElementById(
        'loginMessage'
    )
    .innerHTML =
    msg;

}
