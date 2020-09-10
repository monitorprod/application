
let newEvents = require('./events/readings maq35.json').entries;
const promisify = require('util').promisify;//TODO: replace by feathers client services.
const request = require('request');
const post = promisify(request.post);
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const moment = require('moment');

let cleanEvents = [];
newEvents.map((event, index) => {
    event.sensorUUID = "179d5320-70c7-11e9-b03d-f764a39c0559";
    event.companyUUID = "55017960-fe32-11e8-b860-8f0740c6ffee";
    event.sd = { year: new Date(event.startDate).getUTCFullYear(), month: new Date(event.startDate).getUTCMonth(), date: new Date(event.startDate).getUTCDate(), hour: new Date(event.startDate).getUTCHours(), minute: new Date(event.startDate).getUTCMinutes(), second: new Date(event.startDate).getUTCSeconds() },
    event.ed = { year: new Date(event.endDate).getUTCFullYear(), month: new Date(event.endDate).getUTCMonth(), date: new Date(event.endDate).getUTCDate(), hour: new Date(event.endDate).getUTCHours(), minute: new Date(event.endDate).getUTCMinutes(), second: new Date(event.endDate).getUTCSeconds() },
    delete event.cav;
    delete event.icy;
    delete event.total;
    delete event.c;
    delete event.si;
    delete event.ci;
    delete event.mi;
    delete event.poi;
    delete event.oev;
    delete event.ev;
    delete event.at;
    delete event.oat;
    delete event.w;
    delete event.rp;
    delete event.nw;
    delete event.ui;
    delete event.tu;
    delete event.cd;
    // console.log(index, '==>', typeof (event.totalCycle));// eslint-disable-line no-console
    if (typeof (event.totalCycle) === "number")
        cleanEvents.push(event);
});

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const send = (item) => {
    return new Promise(async (resolve, reject) => {
        if ([0, 15, 30, 45].some(x => x === new Date().getMinutes())) {
            console.log(`aguardando o minuto ${new Date().getMinutes()} passar`);// eslint-disable-line no-console
            await sleep(65000); //wait 1min and 5 sec
        }

        post({ url: `http://localhost:3030/production_order_events`, form: item })
            .then(response => {
                if (Math.floor(response.statusCode / 100) !== 2)
                    throw new Error(`Erro ao enviar ao servidor remoto com status ${response.statusCode}`);

                return response;
            })
            .then(response => {
                if (!response) throw new Error("responsta não possui corpo");
                return JSON.parse(response.body);
            })
            .then(responseBody => {
                if (responseBody && responseBody.r) {
                    resolve({ item: item, response: responseBody });
                }
                else throw new Error('Formulario não possui campos padrões');
            })
            .catch(err => {
                console.warn(err);// eslint-disable-line no-console
                reject(item);
            });
    });
};


const postEach = async (data, onSend, onError, index = 0) => {
    if (index < data.length) {
        console.log(data[index]);// eslint-disable-line no-console
        await sleep(300).then(async () => {
            console.log(`enviando ${index + 1} de ${data.length} ${data[index].sd}`);// eslint-disable-line no-console
            send(data[index])
                .then(response => onSend(response))
                .catch(() => {
                    onError(data[index]);
                })
                .finally(() => postEach(data, onSend, onError, ++index));
        });
    }
};

const onError = item => console.log(`Não consegui salvar na nuvem ... ${item}`);// eslint-disable-line no-console
const onSent = ({item, response}) => console.log(`salvou na nuvem de ${moment(response.sd).format("DD/MM/YYYY HH:mm:ss")} a ${moment(response.ed).format("DD/MM/YYYY HH:mm:ss")} ci:${response.ci} si:${response.si} mi:${response.mi} poi:${response.poi} ev:${response.ev} oev:${response.oev} e contou ${item.totalCycle} ciclos`);// eslint-disable-line no-console

postEach(cleanEvents, onError , onSent );

// const sendAllEvents = async () => Promise.all(cleanEvents.map(event => postEvent(event)));
// sendAllEvents();

// console.log('36 ==>', newEvents[36]);// eslint-disable-line no-console
// console.log('37 ==>', newEvents[37]);// eslint-disable-line no-console
// console.log('38 ==>', newEvents[38]);// eslint-disable-line no-console
// console.log('39 ==>', newEvents[39]);// eslint-disable-line no-console

// postEvent(newEvents[0]);