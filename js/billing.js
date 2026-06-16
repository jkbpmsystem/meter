/* =====================================
   BILLING.JS
===================================== */

let currentGrandTotal = 0;

/* =====================================
   INIT
===================================== */

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        await loadTenants();

        await generateBillNo();

        setDefaultDate();

        bindBillingEvents();

    }
);

/* =====================================
   DEFAULT DATE
===================================== */

function setDefaultDate(){

    const today =
        new Date();

    const yyyy =
        today.getFullYear();

    const mm =
        String(
            today.getMonth()+1
        ).padStart(2,'0');

    const dd =
        String(
            today.getDate()
        ).padStart(2,'0');

    document.getElementById(
        'billDate'
    ).value =
    `${yyyy}-${mm}-${dd}`;

    document.getElementById(
        'billMonth'
    ).value =
    `${yyyy}-${mm}`;

}

/* =====================================
   LOAD TENANTS
===================================== */

async function loadTenants(){

    try{

        const response =
            await fetch(
                `${GAS_URL}?action=getTenants`
            );

        const tenants =
            await response.json();

        const select =
            document.getElementById(
                'tenant'
            );

        select.innerHTML =
            '<option value="">Pilih Penyewa</option>';

        tenants.forEach(t => {

            select.innerHTML +=
            `<option value="${t.name}">
                ${t.name}
            </option>`;

        });

    }
    catch(error){

        console.error(error);

    }

}

/* =====================================
   BILL NUMBER
===================================== */

async function generateBillNo(){

    try{

        const response =
            await fetch(
                `${GAS_URL}?action=getNextBillNo`
            );

        const result =
            await response.json();

        document.getElementById(
            'billNo'
        ).value =
        result.billNo;

    }
    catch(error){

        console.error(error);

    }

}

/* =====================================
   LOAD PREVIOUS READING
===================================== */

async function loadPreviousReading(){

    const tenant =
        document.getElementById(
            'tenant'
        ).value;

    if(!tenant) return;

    try{

        const response =
            await fetch(
                `${GAS_URL}?action=getPreviousReading&tenant=${encodeURIComponent(tenant)}`
            );

        const result =
            await response.json();

        document.getElementById(
            'waterBefore'
        ).value =
        result.water || 0;

        document.getElementById(
            'electricBefore'
        ).value =
        result.electric || 0;

    }
    catch(error){

        console.error(error);

    }

}

/* =====================================
   OCR AIR
===================================== */

async function readWaterMeter(){

    const file =
        document.getElementById(
            'waterImage'
        ).files[0];

    if(!file){

        alert(
            'Pilih gambar meter air.'
        );

        return;
    }

    setLoading(true);

    try{

        const result =
            await Tesseract.recognize(
                file,
                'eng'
            );

        const reading =
            extractMeterValue(
                result.data.text
            );

        document.getElementById(
            'waterAfter'
        ).value =
        reading;

        document.getElementById(
            'waterOCRStatus'
        ).innerHTML =
        `Bacaan: ${reading}`;

    }
    finally{

        setLoading(false);

    }

}

/* =====================================
   OCR ELEKTRIK
===================================== */

async function readElectricMeter(){

    const file =
        document.getElementById(
            'electricImage'
        ).files[0];

    if(!file){

        alert(
            'Pilih gambar meter.'
        );

        return;
    }

    setLoading(true);

    try{

        const result =
            await Tesseract.recognize(
                file,
                'eng'
            );

        const reading =
            extractMeterValue(
                result.data.text
            );

        document.getElementById(
            'electricAfter'
        ).value =
        reading;

        document.getElementById(
            'electricOCRStatus'
        ).innerHTML =
        `Bacaan: ${reading}`;

    }
    finally{

        setLoading(false);

    }

}

/* =====================================
   OCR PARSER
===================================== */

function extractMeterValue(text){

    const matches =
        text.match(/\d+/g);

    if(
        !matches ||
        matches.length === 0
    ){
        return 0;
    }

    return Math.max(
        ...matches.map(Number)
    );

}

/* =====================================
   CALCULATE BILL
===================================== */

async function calculateBill(){

    const waterBefore =
        Number(
            document.getElementById(
                'waterBefore'
            ).value || 0
        );

    const waterAfter =
        Number(
            document.getElementById(
                'waterAfter'
            ).value || 0
        );

    const electricBefore =
        Number(
            document.getElementById(
                'electricBefore'
            ).value || 0
        );

    const electricAfter =
        Number(
            document.getElementById(
                'electricAfter'
            ).value || 0
        );

    const settings =
        await getSettingsData();

    const waterUsage =
        waterAfter - waterBefore;

    const electricUsage =
        electricAfter - electricBefore;

    let waterAmount = 0;

    if(waterUsage <= 35){

        waterAmount =
            waterUsage *
            Number(
                settings.WATER_LOW
            );

    }else{

        waterAmount =
            (35 *
            Number(settings.WATER_LOW))
            +
            (
                (waterUsage-35)
                *
                Number(
                    settings.WATER_HIGH
                )
            );

    }

    const electricAmount =
        electricUsage *
        Number(
            settings.ELECTRIC_RATE
        );

    const serviceCharge =
        Number(
            settings.SERVICE_CHARGE
        ) * 2;

    currentGrandTotal =
        waterAmount +
        electricAmount +
        serviceCharge;

    updatePreview({

        waterUsage,
        electricUsage,
        waterAmount,
        electricAmount,
        serviceCharge,
        total:
        currentGrandTotal

    });

}

/* =====================================
   SETTINGS
===================================== */

async function getSettingsData(){

    const response =
        await fetch(
            `${GAS_URL}?action=getSettings`
        );

    return await response.json();

}

/* =====================================
   UPDATE PREVIEW
===================================== */

function updatePreview(data){

    document.getElementById(
        'previewInfo'
    ).innerHTML = `
        <p>
            Bil Kepada:
            ${document.getElementById('tenant').value}
        </p>
    `;

    document.getElementById(
        'previewWaterUsage'
    ).innerHTML =
    `${data.waterUsage} m³`;

    document.getElementById(
        'previewElectricUsage'
    ).innerHTML =
    `${data.electricUsage} kWh`;

    document.getElementById(
        'previewWaterAmount'
    ).innerHTML =
    `RM ${data.waterAmount.toFixed(2)}`;

    document.getElementById(
        'previewElectricAmount'
    ).innerHTML =
    `RM ${data.electricAmount.toFixed(2)}`;

    document.getElementById(
        'previewTotal'
    ).innerHTML =
    `
    <h2>
        JUMLAH BIL
        RM ${data.total.toFixed(2)}
    </h2>
    `;

}

/* =====================================
   PDF
===================================== */

async function generatePDF(){

    const element =
        document.getElementById(
            'billPreview'
        );

    return html2pdf()
        .set({

            margin:10,

            filename:
            document.getElementById(
                'billNo'
            ).value + '.pdf',

            image:{
                type:'jpeg',
                quality:1
            },

            html2canvas:{
                scale:2
            },

            jsPDF:{
                unit:'mm',
                format:'a4',
                orientation:'portrait'
            }

        })
        .from(element)
        .outputPdf('blob');

}

/* =====================================
   BASE64
===================================== */

function blobToBase64(blob){

    return new Promise(resolve => {

        const reader =
            new FileReader();

        reader.onloadend =
            () => {

                resolve(
                    reader.result
                    .split(',')[1]
                );

            };

        reader.readAsDataURL(
            blob
        );

    });

}

function fileToBase64(file){

    return new Promise(resolve => {

        const reader =
            new FileReader();

        reader.onload =
            () => {

                resolve(
                    reader.result
                    .split(',')[1]
                );

            };

        reader.readAsDataURL(
            file
        );

    });

}

/* =====================================
   SAVE BILL
===================================== */

async function submitBill(){

    if(
        !document.getElementById(
            'verifyReading'
        ).checked
    ){

        alert(
            'Sila sahkan bacaan meter.'
        );

        return;
    }

    const pdfBlob =
        await generatePDF();

    const pdfBase64 =
        await blobToBase64(
            pdfBlob
        );

    const waterFile =
        document.getElementById(
            'waterImage'
        ).files[0];

    const electricFile =
        document.getElementById(
            'electricImage'
        ).files[0];

    const payload = {

        action:'saveBill',

        billNo:
        document.getElementById(
            'billNo'
        ).value,

        tenant:
        document.getElementById(
            'tenant'
        ).value,

        billDate:
        document.getElementById(
            'billDate'
        ).value,

        waterBefore:
        Number(document.getElementById('waterBefore').value),

        waterAfter:
        Number(document.getElementById('waterAfter').value),

        electricBefore:
        Number(document.getElementById('electricBefore').value),

        electricAfter:
        Number(document.getElementById('electricAfter').value),

        grandTotal:
        currentGrandTotal,

        pdfBase64:
        pdfBase64,

        waterImageBase64:
        waterFile
        ? await fileToBase64(waterFile)
        : '',

        electricImageBase64:
        electricFile
        ? await fileToBase64(electricFile)
        : '',

        createdBy:
        getCurrentUser()

    };

    setLoading(true);

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
                    JSON.stringify(
                        payload
                    )
                }
            );

        const result =
            await response.json();

        if(result.success){

            alert(
                'Bil berjaya disimpan.'
            );

            await generateBillNo();

            loadBills();

        }

    }
    finally{

        setLoading(false);

    }

}

/* =====================================
   EVENTS
===================================== */

function bindBillingEvents(){

    document
    .getElementById(
        'tenant'
    )
    ?.addEventListener(
        'change',
        loadPreviousReading
    );

    document
    .getElementById(
        'calculateBtn'
    )
    ?.addEventListener(
        'click',
        calculateBill
    );

}

/* =====================================
   LOADING
===================================== */

function setLoading(show){

    const overlay =
        document.getElementById(
            'loadingOverlay'
        );

    if(!overlay) return;

    overlay.classList[
        show
        ? 'remove'
        : 'add'
    ]('hidden');

}