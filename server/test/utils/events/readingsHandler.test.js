const assert = require('assert');
const rHandler = require('../../../src/utils/events/readingHandler');

let sampleData = {
    "r": [
        {
            "t": "1",
            "m": "15"
        },
        {
            "t": "0",
            "m": "16"
        },
        {
            "t": "0",
            "m": "17"
        },
        {
            "t": "0",
            "m": "18"
        },
        {
            "t": "0",
            "m": "19"
        },
        {
            "t": "0",
            "m": "20"
        },
        {
            "t": "2",
            "m": "21"
        },
        {
            "t": "3",
            "m": "22"
        },
        {
            "t": "0",
            "m": "23"
        },
        {
            "t": "0",
            "m": "24"
        },
        {
            "t": "0",
            "m": "25"
        },
        {
            "t": "2",
            "m": "26"
        },
        {
            "t": "3",
            "m": "27"
        },
        {
            "t": "0",
            "m": "28"
        },
        {
            "t": "0",
            "m": "29"
        }
    ],
    "cav": 6,
    "icy": 3.6,
    "t": 20,
    "tr": 10,
    "c": 30,
    "si": 531,
    "ci": 11,
    "mi": 911,
    "poi": 3371,
    "oev": 311,
    "ev": 311,
    "at": 51,
    "oat": 51,
    "cd": "2020-04-28T14:09:38.968Z",
    "sd": "2020-12-10T09:15:00.000Z",//distribute
    "ed": "2020-12-10T09:29:00.000Z",//distribute
    "tu": 461,
    "_id": "5ea83922dd5ea800177dc3d5"//remove or not copied
}

let sampleData2 = {
    "companyUUID": "55017960-fe32-11e8-b860-8f0740c6ffee",
    "sensorUUID": "dc449c80-fa28-11e8-80f8-6df896377086",
    "r": [
        {
            "t": "0",
            "m": "30"
        },
        {
            "t": "0",
            "m": "31"
        },
        {
            "t": "0",
            "m": "32"
        },
        {
            "t": "0",
            "m": "33"
        },
        {
            "t": "4",
            "m": "34"
        },
        {
            "t": "4",
            "m": "35"
        },
        {
            "t": "4",
            "m": "36"
        },
        {
            "t": "4",
            "m": "37"
        },
        {
            "t": "4",
            "m": "38"
        },
        {
            "t": "4",
            "m": "39"
        },
        {
            "t": "4",
            "m": "40"
        },
        {
            "t": "4",
            "m": "41"
        },
        {
            "t": "4",
            "m": "42"
        },
        {
            "t": "4",
            "m": "43"
        },
        {
            "t": "3",
            "m": "44"
        }
    ],
    "sd": "2020-05-29T08:15:00.000",
    "ed": "2020-05-29T08:29:59.000"
}
//ignore lint next line
let tf = new rHandler({ ...sampleData });

describe('group r by at least 3 consecutive zeros', () => {

    const interval = 3;
    let splitByZeros = tf.splitByZeros().groupedByZeros;
    let result = tf.
        joinGroupedBasedOnInterval(interval).
        formatIntervals('nao justificada', 'nao justificadotipo', true).
        groupedIntervals;

    it('length of each grouped', () => {
        let toCompare = [];
        // console.log(result)
        result.map(grouped => toCompare.push(grouped.r.length));
        assert.deepEqual([1, 5, 2, 3, 4], toCompare)
    })

    it('groups with/without Zeros in it', () => {
        let toCompare = [];
        result.map(grouped => toCompare.push(grouped.r[0].t === '0'));
        assert.deepEqual([false, true, false, true, false], toCompare)
    });

    it('r r counters per group', () => {
        let toCompare = [];
        result.map(grouped => toCompare.push(grouped.tr));
        assert.deepEqual([1, 0, 5, 0, 5], toCompare)
    });

    it('added fz at the end of group', () => {
        assert.equal(result[result.length - 1].fz, 2)
    });

    // console.log(result)
    // console.log('/////////////////////////////')
});

describe('considering the zeros in previous and next events', () => {
    const interval = 3;
    tf2 = new rHandler({ ...sampleData });

    let result2 = tf2.
        splitByZeros().
        joinGroupedBasedOnInterval(interval, 4, 1).
        formatIntervals('nao justificada', 'nao justificadotipo', true).
        groupedIntervals;

    it('length of each grouped', () => {
        let toCompare = [];
        result2.map(grouped => toCompare.push(grouped.r.length));
        assert.deepEqual([1, 5, 2, 3, 2, 6], toCompare)
    })

    it('groups with/without Zeros in it', () => {
        let toCompare = [];
        result2.map(grouped => toCompare.push(grouped.r[0].t === '0'));
        assert.deepEqual([false, true, false, true, false, true], toCompare)
    });

    it('r r counters per group', () => {
        let toCompare = [];
        result2.map(grouped => toCompare.push(grouped.tr));
        assert.deepEqual([1, 0, 5, 0, 5, 0], toCompare)
    });

    // console.log(result2);

});


describe('data with 0 in the beggining => should split in more than one group', () => {
    let interval = 5;
    tf2 = new rHandler({ ...sampleData2 });
    let result = tf2.
        splitByZeros().
        joinGroupedBasedOnInterval(interval, 4, 1).
        formatIntervals('nao justificada', 'nao justificadotipo', true).
        groupedIntervals;

    // result.map(res => console.log(res))

    it('length of each grouped', () => {
        let toCompare = [];
        //console.log(result)
        result.map(grouped => toCompare.push(grouped.r.length));
        assert.deepEqual([5, 11], toCompare)
    });

    it('groups with/without Zeros in it', () => {
        let toCompare = [];
        result.map(grouped => toCompare.push(grouped.r[0].t === '0'));
        assert.deepEqual([true, false], toCompare)
    });

    it('r r counters per group', () => {
        let toCompare = [];
        result.map(grouped => toCompare.push(grouped.tr));
        assert.deepEqual([0, 43], toCompare)
    });
});

describe('data with 0 in the beggining and big interval => should not split', () => {

    interval = 6; //shouldn't split
    tf2 = new rHandler({ ...sampleData2 });
    let result2 = tf2.
        splitByZeros().
        joinGroupedBasedOnInterval(interval, 4, 1).
        formatIntervals('nao justificada', 'nao justificadotipo', true).
        groupedIntervals;

    // result.map(res => console.log(res))

    it('length of each grouped', () => {
        let toCompare = [];
        //console.log(result)
        result2.map(grouped => toCompare.push(grouped.r.length));
        assert.deepEqual([15], toCompare)
    });

    it('r r counters per group', () => {
        let toCompare = [];
        result2.map(grouped => toCompare.push(grouped.tr));
        assert.deepEqual([43], toCompare)
    });
});