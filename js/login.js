const GAS_URL =
'https://script.google.com/macros/s/AKfycbwZiv7WCHXKe_Rk8Hwy28IeOyrBRGT6Qg46LvRkFXuxNG9bpodru_gKxtor8UYyQkpS/exec';

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

        const response = await fetch(GAS_URL,{
    method:'POST',
    headers:{
        'Content-Type':'application/json'
    },
    body:JSON.stringify({
        action:'login',
        username,
        password
    })
});

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
