/* =====================================
   FINAL SETTINGS.JS
===================================== */

let currentSettings = {};

/* =====================================
   LOAD SETTINGS
===================================== */

async function loadSettings(){

    try{

        App.setLoading(true);

        const response =
            await fetch(

                `${GAS_URL}?action=getSettings`

            );

        currentSettings =
            await response.json();

        populateSettings(
            currentSettings
        );

        updatePreview();

    }
    catch(error){

        console.error(
            error
        );

        alert(
            'Gagal memuatkan tetapan.'
        );

    }
    finally{

        App.setLoading(false);

    }

}

/* =====================================
   POPULATE FORM
===================================== */

function populateSettings(data){

    setValue(
        'waterLowRate',
        data.WATER_LOW || 0
    );

    setValue(
        'waterHighRate',
        data.WATER_HIGH || 0
    );

    setValue(
        'electricRate',
        data.ELECTRIC_RATE || 0
    );

    setValue(
        'serviceCharge',
        data.SERVICE_CHARGE || 0
    );

}

/* =====================================
   SAVE SETTINGS
===================================== */

async function saveSettings(){

    const waterLow =
        getValue(
            'waterLowRate'
        );

    const waterHigh =
        getValue(
            'waterHighRate'
        );

    const electric =
        getValue(
            'electricRate'
        );

    const service =
        getValue(
            'serviceCharge'
        );

    const ok =
        confirm(
            'Simpan tetapan baru?'
        );

    if(!ok)
        return;

    try{

        App.setLoading(true);

        await updateSetting(
            'WATER_LOW',
            waterLow
        );

        await updateSetting(
            'WATER_HIGH',
            waterHigh
        );

        await updateSetting(
            'ELECTRIC_RATE',
            electric
        );

        await updateSetting(
            'SERVICE_CHARGE',
            service
        );

        alert(
            'Tetapan berjaya disimpan.'
        );

        updatePreview();

    }
    catch(error){

        console.error(
            error
        );

        alert(
            'Gagal menyimpan tetapan.'
        );

    }
    finally{

        App.setLoading(false);

    }

}

/* =====================================
   UPDATE SINGLE SETTING
===================================== */

async function updateSetting(
    key,
    value
){

    const response =
        await fetch(
            GAS_URL,
            {
                method:'POST',

                body:
                JSON.stringify({

                    action:
                    'updateSetting',

                    key:
                    key,

                    value:
                    value

                })

            }
        );

    const result =
        await response.json();

    if(!result.success){

        throw new Error(
            result.message ||
            'Update gagal'
        );

    }

    return result;

}

/* =====================================
   PREVIEW
===================================== */

function updatePreview(){

    setText(

        'previewWaterLow',

        `RM ${
            Number(
                getValue(
                    'waterLowRate'
                )
            ).toFixed(2)
        }`

    );

    setText(

        'previewWaterHigh',

        `RM ${
            Number(
                getValue(
                    'waterHighRate'
                )
            ).toFixed(2)
        }`

    );

    setText(

        'previewElectric',

        `RM ${
            Number(
                getValue(
                    'electricRate'
                )
            ).toFixed(2)
        }`

    );

    setText(

        'previewService',

        `RM ${
            Number(
                getValue(
                    'serviceCharge'
                )
            ).toFixed(2)
        }`

    );

}

/* =====================================
   RESET DEFAULT
===================================== */

async function resetDefaultSettings(){

    const ok =
        confirm(
            'Reset ke tetapan asal?'
        );

    if(!ok)
        return;

    try{

        App.setLoading(true);

        setValue(
            'waterLowRate',
            1.70
        );

        setValue(
            'waterHighRate',
            2.10
        );

        setValue(
            'electricRate',
            0.60
        );

        setValue(
            'serviceCharge',
            5.00
        );

        updatePreview();

    }
    catch(error){

        console.error(
            error
        );

    }
    finally{

        App.setLoading(false);

    }

}

/* =====================================
   FORM EVENT
===================================== */

function bindSettingsEvents(){

    const ids = [

        'waterLowRate',
        'waterHighRate',
        'electricRate',
        'serviceCharge'

    ];

    ids.forEach(id => {

        const element =
            document.getElementById(
                id
            );

        if(element){

            element.addEventListener(

                'input',

                updatePreview

            );

        }

    });

}

/* =====================================
   HELPERS
===================================== */

function getValue(id){

    return document
        .getElementById(id)
        ?.value || '';

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

        el.value =
            value;

    }

}

/* =====================================
   AUTO LOAD
===================================== */

document.addEventListener(

    'DOMContentLoaded',

    function(){

        if(

            document.getElementById(
                'waterLowRate'
            )

        ){

            loadSettings();

            bindSettingsEvents();

        }

    }

);
