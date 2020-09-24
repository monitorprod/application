const moment = require('moment');

// interface readingMinute {
//     t: number,
//     m: number
// }

// interface eventData {
//     // readings
//     r?: readingMinute,
//     // open cavities
//     cav: number,
//     // ideal cycle
//     icy: number,
//     // total production
//     t: number,
//     // total readings
//     tr: number,
//     // average cycle reading
//     c: number,
//     // sensor
//     si: number,
//     // company
//     ci: number,
//     // machine // TODO ADD moldId and productId to reduce the populates!!!
//     mi: number,
//     // allZeros
//     az?: boolean,
//     // productionOrder
//     poi: number,
//     // original productionOrderEventType
//     oev: number,
//     // productionOrderEventType => events list "PARADA PROGRAMADA MANUTENÇÂO MECÂNICA"
//     ev: number,
//     // productionOrderActionType => event type "PARADA PROGRAMADA"
//     at: number,
//     // original productionOrderActionType
//     oat: number,
//     // currentDate
//     cd: date,
//     // startDate
//     sd: date,
//     // endDate
//     ed: date,
//     // warning flag
//     w?: boolean,
//     // restored production
//     rp?: boolean,
//     // noise warning
//     nw?: boolean,
//     // user
//     ui?: number,
//     // turn
//     tu?: number,
// }


class readingHandler {

    constructor(data) {
        if (!data)
            throw "readings data not defined"
        this.readings = data.r;//only readings props
        this.groupedByZeros = [];//only split by all been 0 or all not 0
        this.groupedByInterval = [];//split in groups with at least n zeros
        this.groupedIntervals = [];//formatted groups of data with all props
        this.data = data;//everything expect readings prop
        this.allZeros = data.az;
        delete this.data.r;
    }

    get groupedByIntervals() {
        return this.groupedByInterval;
    }

    splitByZeros() {
        /* #region Helper Functions */
        const updateLastGroup = reading => this.groupedByZeros.length > 0 ? this.groupedByZeros[this.groupedByZeros.length - 1].push(reading) : this.groupedByZeros.push([reading]);
        const createNewGroup = reading => this.groupedByZeros.push([reading]);
        const isTheSameType = (a, b) => (a.t === '0' && b.t === '0') || (a.t != '0' && b.t != '0');
        /* #endregion */
        /* #region  all zeros handler */
        if (this.allZeros) {
            let timeLength = moment(this.data.ed).diff(this.data.sd, 'minutes') + 1;
            this.readings = [];
            for (let index = 0; index <= timeLength; index++) {
                let currentMinute = moment(this.data.sd).add(index, 'minutes').minutes();
                this.readings.push({ m: currentMinute.toString(), t: '0'})
            }
        }
        // console.log('===>', this.readings)
        /* #endregion */
        let previous;
        let counter = 0;
        this.readings.map(reading => {
            if (this.groupedByZeros.length === 0) { //save first always
                this.groupedByZeros.push([reading]);
                counter++;
            } else {//compare to last saved minute to group together or create new group
                if (isTheSameType(previous, reading))
                    updateLastGroup(reading)
                else {
                    createNewGroup(reading)
                }
            }

            previous = reading;
        });
        console.log('calculated split',this.groupedByZeros);
        return this;
    }

    joinGroupedBasedOnInterval(interval, initialZeros, finalZeros) {
        if (!interval)
            throw "interval in minutes not defined"

            // console.log('////////////////////',interval)
        this.minZerosToBeSplitted = interval;
        /* #region Helper Functions */
        const hasOnlyZeros = timeFrame => {
            timeFrame.map(tf => {
                if (tf.t !== '0')
                    return false;
            })

            return true;
        };
        const createNewGroup = group => this.groupedByInterval.push(group);
        const updateLastGroup = group => this.groupedByInterval[this.groupedByInterval.length - 1] = this.groupedByInterval[this.groupedByInterval.length - 1].concat(group);
        /* #endregion */
        let previous;

        const isLastWithOnlyZeros = (group, index) => group[0].t === '0' && index === this.groupedByZeros.length - 1;

        this.groupedByZeros.map((group, index) => {
            if (index === 0) { //if is first does not matter if with or without 0
                /* #region add previous 0 to be computed */
                if (finalZeros && group[0].t === '0' && finalZeros + group.length >= interval) {
                    let newData = Array(finalZeros).fill().map((item, index) => ({ t: '0', m: parseInt(group[0].m) - index - 1 > 0 ? (parseInt(group[0].m) - index - 1).toString() : (parseInt(group[0].m) - index - 1 + 60).toString() }))
                    group = [...newData, ...group];
                    this.data.sd = moment(this.data.sd).subtract(finalZeros, 'minutes');
                }
                /* #endregion */
                createNewGroup(group);
            }
            else {
                if (isLastWithOnlyZeros(group, index)) {
                    if (previous.length + (initialZeros || 0) < interval) {
                        updateLastGroup(group);
                    }
                    else {
                        createNewGroup(group);
                    }
                }
                else {
                    if (group[0].t === '0') { //if it is a group of 0's
                        if (group.length + (initialZeros || 0) >= interval) {
                            createNewGroup(group);
                        } else
                            updateLastGroup(group);
                    }
                    else {
                        if (!hasOnlyZeros(previous) || (hasOnlyZeros(previous) && previous.length < interval)) //case the first element
                            updateLastGroup(group);
                        else {
                            createNewGroup(group);
                        }
                    }
                }
            }

            previous = group
        });



        /* #region add next 0 to be computed at the final*/
        if (initialZeros) {
            let lastMinute = parseInt(previous[previous.length - 1].m) + 1;
            let newData = Array(initialZeros).fill().map((item, index) => ({ t: '0', m: lastMinute + index < 60 ? (lastMinute + index).toString() : (lastMinute + index - 60).toString() }))
            let shouldAdd = this.groupedByInterval[this.groupedByInterval.length - 1][this.groupedByInterval[this.groupedByInterval.length - 1].length - 1].t === '0'
            if (shouldAdd)
                updateLastGroup(newData);
            // else
            //     createNewGroup(newData);
        }
        /* #endregion */


        return this;
    }

    formatIntervals(noJustifiedEventId, noJustifiedActionType, shouldAddReadings = false) {//add args for each prop calculation , shouldAddReadings is only for testing proposes
        const hasOnlyZeros = interval => interval[0].t === '0';

        const setCounters = (interval) => {
            let totalReadings = 0;
            interval.map(reading => {
                totalReadings += parseInt(reading.t);
            })
            return ({
                tr: totalReadings,//add all counts do interval
            })
        };


        const setDates = (sd, ed) => ({
            sd: moment(sd).toDate(),
            ed: moment(ed).toDate(),
        })

        const setEvents = (interval, data) => ({
            ev: hasOnlyZeros(interval) ? noJustifiedEventId : data.ev,
            at: hasOnlyZeros(interval) ? noJustifiedActionType : data.at,
            oev: hasOnlyZeros(interval) ? noJustifiedEventId : data.oev,
            oat: hasOnlyZeros(interval) ? noJustifiedActionType : data.oat,
        });

        const addZerosCounter = ([initialZeros, finalZeros]) => {
            if (initialZeros > 0 && finalZeros > 0)
                return ({ iz: initialZeros, fz: finalZeros });
            if (initialZeros > 0)
                return ({ iz: initialZeros });
            if (finalZeros > 0)
                return ({ fz: finalZeros });
        };

        const addReadings = (should, interval) => should ? ({ r: interval }) : ({});

        let startDate = this.data.sd;
        let endDate;
        this.groupedByIntervals.map((interval, index) => {
            const shouldAddZeroCounter = () => {
                let initialZeros = 0;
                let finalZeros = 0;

                if (index === 0 || index === this.groupedByIntervals.length - 1) {
                    let initialGroup = this.groupedByIntervals[0];
                    let finalGroup = this.groupedByIntervals[this.groupedByIntervals.length - 1];
                    if (initialGroup[0].t === '0' && index === 0) {
                        // console.log('beginning =>', initialGroup, initialGroup[0].t === '0');
                        let index = 0;
                        while (index < initialGroup.length && initialGroup[index].t === '0') {
                            initialZeros++;
                            index++;
                        }
                        if (initialZeros >= this.minZerosToBeSplitted)
                            initialZeros = 0;
                    }
                    if (finalGroup[finalGroup.length - 1].t === '0' && index === this.groupedByIntervals.length - 1) {
                        // console.log('final =>', finalGroup, finalGroup[finalGroup.length - 1].t === '0');
                        let index = finalGroup.length - 1;
                        while (index > 0 && finalGroup[index].t === '0') {
                            finalZeros++;
                            index--;
                        }
                        if (finalZeros >= this.minZerosToBeSplitted)
                            finalZeros = 0;
                    }
                }
                // console.log(initialZeros, finalZeros);
                return [initialZeros, finalZeros];
            }
            // console.log('*****',interval)
            endDate = moment(startDate).add(interval.length, 'minute').toDate();
            this.groupedIntervals.push(({
                ...addReadings(shouldAddReadings, interval),
                //rds: JSON.stringify(interval), //TODO: ONLY FOR TESTING PuRPOSE...
                ...setCounters(interval),
                tu: this.data.tu,
                ui: this.data.ui,
                ...setEvents(interval, this.data),
                ...setDates(startDate, endDate),
                ...addZerosCounter(shouldAddZeroCounter())
            }))
            startDate = endDate;
        })
        // console.log('calculated format',this.groupedIntervals);
        return this;
    }
}

module.exports = readingHandler;