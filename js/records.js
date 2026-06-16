/* =====================================
   RECORDS.JS
===================================== */

let billRecords = [];

/* =====================================
   LOAD BILLS
===================================== */

async function loadBills(){

    try{

        const response =
            await fetch(
                `${GAS_URL}?action=getBills`
            );

        const data =
            await response.json();

        billRecords = data || [];

        renderBills(
            billRecords
        );

        updateBillSummary(
            billRecords
        );

    }
    catch(error){

        console.error(error);

        alert(
            'Gagal memuatkan rekod bil.'
        );

    }

}

/* =====================================
   RENDER TABLE
===================================== */

function renderBills(data){

    const tbody =
        document.querySelector(
            '#recordsTable tbody'
        );

    if(!tbody) return;

    tbody.innerHTML = '';

    data.forEach(row => {

        tbody.innerHTML += `

        <tr>

            <td>${row.noBill}</td>

            <td>${row.tenant}</td>

            <td>${formatDate(row.date)}</td>

            <td>
                RM ${Number(
                    row.total
                ).toFixed(2)}
            </td>

            <td>

                <span
                class="status ${getStatusClass(row.status)}">

                    ${row.status}

                </span>

            </td>

            <td>

                <button
                class="btn view"
                onclick="viewBill('${row.pdfUrl}')">

                👁

                </button>

                <button
                class="btn print"
                onclick="printBill('${row.pdfUrl}')">

                🖨

                </button>

                <button
                class="btn edit"
                onclick="editBill('${row.id}')">

                ✏

                </button>

                <button
                class="btn delete"
                onclick="cancelBill('${row.id}')">

                ✖

                </button>

            </td>

        </tr>

        `;

    });

}

/* =====================================
   FILTER
===================================== */

function filterBills(){

    const billNo =
        document.getElementById(
            'searchBill'
        ).value.toLowerCase();

    const tenant =
        document.getElementById(
            'searchTenant'
        ).value.toLowerCase();

    const month =
        document.getElementById(
            'searchMonth'
        ).value;

    const status =
        document.getElementById(
            'searchStatus'
        ).value;

    const filtered =
        billRecords.filter(row => {

            const rowDate =
                row.date
                ? String(row.date)
                : '';

            const matchBill =

                !billNo ||

                row.noBill
                .toLowerCase()
                .includes(billNo);

            const matchTenant =

                !tenant ||

                row.tenant
                .toLowerCase()
                .includes(tenant);

            const matchMonth =

                !month ||

                rowDate.includes(month);

            const matchStatus =

                !status ||

                row.status === status;

            return (

                matchBill &&
                matchTenant &&
                matchMonth &&
                matchStatus

            );

        });

    renderBills(
        filtered
    );

}

/* =====================================
   RESET FILTER
===================================== */

function resetBillFilter(){

    document.getElementById(
        'searchBill'
    ).value = '';

    document.getElementById(
        'searchTenant'
    ).value = '';

    document.getElementById(
        'searchMonth'
    ).value = '';

    document.getElementById(
        'searchStatus'
    ).value = '';

    renderBills(
        billRecords
    );

}

/* =====================================
   VIEW PDF
===================================== */

function viewBill(url){

    if(!url){

        alert(
            'PDF tidak dijumpai.'
        );

        return;
    }

    const viewer =
        document.getElementById(
            'pdfViewer'
        );

    if(viewer){

        viewer.src = url;

        document
        .getElementById(
            'pdfModal'
        )
        .classList.remove(
            'hidden'
        );

    }else{

        window.open(
            url,
            '_blank'
        );

    }

}

/* =====================================
   CLOSE PDF
===================================== */

function closePdfModal(){

    document
    .getElementById(
        'pdfModal'
    )
    ?.classList.add(
        'hidden'
    );

}

/* =====================================
   PRINT PDF
===================================== */

function printBill(url){

    if(!url) return;

    const win =
        window.open(
            url
        );

    if(win){

        win.onload =
        function(){

            win.print();

        };

    }

}

/* =====================================
   EDIT BILL
===================================== */

function editBill(id){

    localStorage.setItem(
        'editBillId',
        id
    );

    showSection(
        'billing'
    );

    alert(
        'Mode Kemaskini Bil.'
    );

}

/* =====================================
   CANCEL BILL
===================================== */

async function cancelBill(id){

    const ok =
        confirm(
            'Batalkan bil ini?'
        );

    if(!ok) return;

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
                        'cancelBill',

                        id:id

                    })

                }
            );

        const result =
            await response.json();

        if(result.success){

            loadBills();

        }

    }
    catch(error){

        console.error(error);

    }

}

/* =====================================
   SUMMARY
===================================== */

function updateBillSummary(data){

    const active =
        data.filter(
            x => x.status === 'AKTIF'
        ).length;

    const updated =
        data.filter(
            x => x.status === 'DIKEMASKINI'
        ).length;

    const cancelled =
        data.filter(
            x => x.status === 'DIBATALKAN'
        ).length;

    setValue(
        'activeBillCount',
        active
    );

    setValue(
        'updatedBillCount',
        updated
    );

    setValue(
        'cancelBillCount',
        cancelled
    );

    setValue(
        'totalBillCount',
        data.length
    );

}

/* =====================================
   EXPORT CSV
===================================== */

function exportCSV(){

    let csv =
        'No Bil,Penyewa,Tarikh,Jumlah,Status\n';

    billRecords.forEach(row => {

        csv +=
        `"${row.noBill}",` +
        `"${row.tenant}",` +
        `"${row.date}",` +
        `"${row.total}",` +
        `"${row.status}"\n`;

    });

    downloadFile(
        csv,
        'rekod_bil.csv',
        'text/csv'
    );

}

/* =====================================
   EXPORT EXCEL
===================================== */

function exportExcel(){

    exportCSV();

}

/* =====================================
   PRINT LIST
===================================== */

function printBillList(){

    const printWindow =
        window.open(
            '',
            '_blank'
        );

    let html = `

    <html>

    <head>

        <title>
        Rekod Bil
        </title>

    </head>

    <body>

    <h2>
    Rekod Bil Utiliti
    </h2>

    <table border="1"
    cellspacing="0"
    cellpadding="5">

    <tr>

        <th>No Bil</th>
        <th>Penyewa</th>
        <th>Tarikh</th>
        <th>Jumlah</th>
        <th>Status</th>

    </tr>

    `;

    billRecords.forEach(row => {

        html += `

        <tr>

            <td>${row.noBill}</td>

            <td>${row.tenant}</td>

            <td>${row.date}</td>

            <td>RM ${row.total}</td>

            <td>${row.status}</td>

        </tr>

        `;

    });

    html += `
        </table>
        </body>
        </html>
    `;

    printWindow.document.write(
        html
    );

    printWindow.document.close();

    printWindow.print();

}

/* =====================================
   HELPERS
===================================== */

function downloadFile(
    content,
    filename,
    type
){

    const blob =
        new Blob(
            [content],
            {type}
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            'a'
        );

    a.href =
        url;

    a.download =
        filename;

    a.click();

    URL.revokeObjectURL(
        url
    );

}

function setValue(
    id,
    value
){

    const el =
        document.getElementById(
            id
        );

    if(el){

        el.innerText =
        value;

    }

}

function formatDate(date){

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

}

function getStatusClass(status){

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

/* =====================================
   INIT
===================================== */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        if(
            document.getElementById(
                'recordsTable'
            )
        ){

            loadBills();

        }

    }
);