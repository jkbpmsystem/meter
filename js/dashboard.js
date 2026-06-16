/* =====================================
   FINAL DASHBOARD.JS
   PART 1
===================================== */

/* =====================================
   GLOBAL APP
===================================== */

window.App = {

    /* CURRENT USER */

    getCurrentUser(){

        try{

            const user = JSON.parse(

                localStorage.getItem(
                    'hszaUser'
                )

            );

            return user;

        }
        catch{

            return null;

        }

    },

    /* LOADING */

    setLoading(show){

        const overlay =
            document.getElementById(
                'loadingOverlay'
            );

        if(!overlay)
            return;

        if(show){

            overlay.classList.remove(
                'hidden'
            );

        }else{

            overlay.classList.add(
                'hidden'
            );

        }

    },

    /* DATE FORMAT */

    formatDate(date){

        if(!date)
            return '';

        try{

            return new Date(
                date
            ).toLocaleDateString(
                'ms-MY'
            );

        }
        catch{

            return date;

        }

    },

    /* STATUS CLASS */

    getStatusClass(status){

        switch(status){

            case 'AKTIF':
                return 'aktif';

            case 'DIKEMASKINI':
                return 'kemaskini';

            case 'DIBATALKAN':
                return 'batal';

            default:
                return '';

        }

    }

};

/* =====================================
   CONFIG
===================================== */

const GAS_URL =
'https://YOUR_WEB_APP_URL';

/* =====================================
   SESSION CHECK
===================================== */

function checkSession(){

    const user =
        App.getCurrentUser();

    if(!user){

        window.location.href =
            'login.html';

        return false;

    }

    const label =
        document.getElementById(
            'loggedUser'
        );

    if(label){

        label.innerHTML =

            `${user.name}
            (${user.role})`;

    }

    return true;

}

/* =====================================
   LOGOUT
===================================== */

function logout(){

    const ok =
        confirm(
            'Logout sistem?'
        );

    if(!ok)
        return;

    localStorage.removeItem(
        'hszaUser'
    );

    window.location.href =
        'login.html';

}

/* =====================================
   ROLE CONTROL
===================================== */

function setupRoleMenu(){

    const user =
        App.getCurrentUser();

    if(!user)
        return;

    const usersMenu =
        document.getElementById(
            'usersMenu'
        );

    const settingsMenu =
        document.getElementById(
            'settingsMenu'
        );

    if(

        user.role !==
        'ADMIN'

    ){

        if(usersMenu){

            usersMenu.style.display =
            'none';

        }

        if(settingsMenu){

            settingsMenu.style.display =
            'none';

        }

    }

}

/* =====================================
   SECTION NAVIGATION
===================================== */

function showSection(name){

    const sections = [

        'dashboardSection',

        'billingSection',

        'recordsSection',

        'usersSection',

        'settingsSection'

    ];

    sections.forEach(id => {

        const el =
            document.getElementById(
                id
            );

        if(el){

            el.classList.add(
                'hidden'
            );

        }

    });

    const target =
        document.getElementById(

            `${name}Section`

        );

    if(target){

        target.classList.remove(
            'hidden'
        );

    }

    updatePageTitle(
        name
    );

}

/* =====================================
   PAGE TITLE
===================================== */

function updatePageTitle(name){

    const title =
        document.querySelector(
            '.header h1'
        );

    if(!title)
        return;

    const map = {

        dashboard:
        'Dashboard',

        billing:
        'Bil Baharu',

        records:
        'Rekod Bil',

        users:
        'Pengguna',

        settings:
        'Tetapan'

    };

    title.innerHTML =

        map[name]
        ||
        'Dashboard';

}

/* =====================================
   DASHBOARD
===================================== */

async function loadDashboard(){

    try{

        App.setLoading(
            true
        );

        await loadDashboardStats();

        await loadRecentBills();

    }
    catch(error){

        console.error(
            error
        );

    }
    finally{

        App.setLoading(
            false
        );

    }

}

/* =====================================
   STATS
===================================== */

async function loadDashboardStats(){

    const response =
        await fetch(

            `${GAS_URL}?action=dashboardStats`

        );

    const stats =
        await response.json();

    setText(
        'billCount',
        stats.billCount || 0
    );

    setText(
        'collection',
        `RM ${
            Number(
                stats.collection || 0
            ).toFixed(2)
        }`
    );

    setText(
        'tenantCount',
        stats.tenantCount || 0
    );

    setText(
        'lastBill',
        stats.lastBill || '-'
    );

}

/* =====================================
   RECENT BILLS
===================================== */

async function loadRecentBills(){

    const response =
        await fetch(

            `${GAS_URL}?action=getRecentBills`

        );

    const data =
        await response.json();

    renderRecentBills(
        data
    );

}

/* =====================================
   RENDER RECENT
===================================== */

function renderRecentBills(data){

    const tbody =
        document.getElementById(
            'recentBillsTable'
        );

    if(!tbody)
        return;

    tbody.innerHTML = '';

    data.forEach(row => {

        tbody.innerHTML += `

        <tr>

            <td>

                ${row.noBill}

            </td>

            <td>

                ${row.tenant}

            </td>

            <td>

                ${App.formatDate(
                    row.date
                )}

            </td>

            <td>

                RM ${Number(
                    row.total
                ).toFixed(2)}

            </td>

            <td>

                <span class="status
                ${App.getStatusClass(
                    row.status
                )}">

                    ${row.status}

                </span>

            </td>

        </tr>

        `;

    });

}

/* =====================================
   HELPER
===================================== */

function setText(
    id,
    value
){

    const el =
        document.getElementById(
            id
        );

    if(el){

        el.innerHTML =
        value;

    }

}


let dashboardChart = null;

/* =====================================
   LOAD CHART DATA
===================================== */

async function loadCollectionChart(){

    try{

        const response =
            await fetch(

                `${GAS_URL}?action=getDashboardChart`

            );

        const chartData =
            await response.json();

        renderCollectionChart(
            chartData
        );

    }
    catch(error){

        console.error(
            error
        );

    }

}

/* =====================================
   RENDER CHART
===================================== */

function renderCollectionChart(
    data
){

    const canvas =
        document.getElementById(
            'collectionChart'
        );

    if(!canvas)
        return;

    if(
        dashboardChart
    ){

        dashboardChart.destroy();

    }

    dashboardChart =
        new Chart(

            canvas,

            {

                type:'bar',

                data:{

                    labels:
                    data.labels || [],

                    datasets:[{

                        label:
                        'Kutipan Bulanan',

                        data:
                        data.values || [],

                        borderWidth:1

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    plugins:{

                        legend:{

                            display:true

                        }

                    },

                    scales:{

                        y:{

                            beginAtZero:true

                        }

                    }

                }

            }

        );

}

/* =====================================
   DASHBOARD REFRESH
===================================== */

async function refreshDashboard(){

    try{

        App.setLoading(
            true
        );

        await loadDashboard();

        await loadCollectionChart();

        if(
            typeof loadBills ===
            'function'
        ){

            await loadBills();

        }

        if(
            typeof loadUsers ===
            'function'
        ){

            await loadUsers();

        }

        if(
            typeof loadSettings ===
            'function'
        ){

            await loadSettings();

        }

    }
    catch(error){

        console.error(
            error
        );

    }
    finally{

        App.setLoading(
            false
        );

    }

}

/* =====================================
   MENU ACTIVE
===================================== */

function bindMenuActive(){

    const menuItems =
        document.querySelectorAll(
            '.menu li'
        );

    menuItems.forEach(item => {

        item.addEventListener(
            'click',
            function(){

                menuItems.forEach(
                    m =>
                    m.classList.remove(
                        'active'
                    )
                );

                this.classList.add(
                    'active'
                );

            }
        );

    });

}

/* =====================================
   KEYBOARD SHORTCUT
===================================== */

function bindShortcuts(){

    document.addEventListener(
        'keydown',
        function(e){

            if(
                e.ctrlKey &&
                e.key === 'r'
            ){

                e.preventDefault();

                refreshDashboard();

            }

        }
    );

}

/* =====================================
   AUTO REFRESH
===================================== */

function startAutoRefresh(){

    setInterval(

        () => {

            loadDashboard();

        },

        300000

    );

}

/* =====================================
   APP STARTUP
===================================== */

async function initializeApp(){

    const valid =
        checkSession();

    if(!valid)
        return;

    setupRoleMenu();

    bindMenuActive();

    bindShortcuts();

    showSection(
        'dashboard'
    );

    await loadDashboard();

    await loadCollectionChart();

    startAutoRefresh();

}

/* =====================================
   GLOBAL ERROR
===================================== */

window.addEventListener(
    'error',
    function(event){

        console.error(
            'Global Error:',
            event.error
        );

    }
);

/* =====================================
   UNHANDLED PROMISE
===================================== */

window.addEventListener(
    'unhandledrejection',
    function(event){

        console.error(
            'Promise Error:',
            event.reason
        );

    }
);

/* =====================================
   DOM READY
===================================== */

document.addEventListener(

    'DOMContentLoaded',

    async function(){

        try{

            await initializeApp();

        }
        catch(error){

            console.error(
                error
            );

            alert(
                'Ralat semasa memulakan sistem.'
            );

        }

    }

);

/* =====================================
   GLOBAL EXPORT
===================================== */

window.showSection =
    showSection;

window.logout =
    logout;

window.refreshDashboard =
    refreshDashboard;