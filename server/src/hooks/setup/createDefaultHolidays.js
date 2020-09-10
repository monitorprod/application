const lodash = require("lodash");
const moment = require("moment");

module.exports = function() {
  return async context => {
    const { data } = context;
    if (lodash.isNil(data.holidays)) {
      const recurringHolidays = lodash.map(
        [
          {
            name: "Confraternização Universal",
            startDate: moment("2019-01-01T08:00:00"),
            endDate: moment("2019-01-02T08:00:00")
          },
          {
            name: "Tiradentes",
            startDate: moment("2019-04-21T08:00:00"),
            endDate: moment("2019-04-22T08:00:00")
          },
          {
            name: "Dia do Trabalho",
            startDate: moment("2019-05-01T08:00:00"),
            endDate: moment("2019-05-02T08:00:00")
          },
          {
            name: "Independência do Brasil",
            startDate: moment("2019-09-07T08:00:00"),
            endDate: moment("2019-09-08T08:00:00")
          },
          {
            name: "Nossa Sr.a Aparecida - Padroeira do Brasil",
            startDate: moment("2019-10-12T08:00:00"),
            endDate: moment("2019-10-13T08:00:00")
          },
          {
            name: "Finados",
            startDate: moment("2019-11-02T08:00:00"),
            endDate: moment("2019-11-03T08:00:00")
          },
          {
            name: "Proclamação da República",
            startDate: moment("2019-11-15T08:00:00"),
            endDate: moment("2019-11-16T08:00:00")
          },
          {
            name: "Natal",
            startDate: moment("2019-12-25T08:00:00"),
            endDate: moment("2019-12-26T08:00:00")
          }
        ],
        day => ({
          ...day,
          noWorkDay: true,
          recurring: true,
          isSystemHoliday: true
        })
      );
      data.holidays = lodash.map(
        [
          {
            name: "Segunda Feira Carnaval",
            startDate: moment("2019-03-04T08:00:00"),
            endDate: moment("2019-03-05T08:00:00")
          },
          {
            name: "Segunda Feira Carnaval",
            startDate: moment("2020-02-24T08:00:00"),
            endDate: moment("2020-02-25T08:00:00")
          },
          {
            name: "Segunda Feira Carnaval",
            startDate: moment("2021-02-15T08:00:00"),
            endDate: moment("2021-02-16T08:00:00")
          },
          {
            name: "Segunda Feira Carnaval",
            startDate: moment("2022-02-28T08:00:00"),
            endDate: moment("2022-03-01T08:00:00")
          },
          {
            name: "Segunda Feira Carnaval",
            startDate: moment("2023-02-20T08:00:00"),
            endDate: moment("2023-02-21T08:00:00")
          },

          {
            name: "Terça Feira Carnaval",
            startDate: moment("2019-03-05T08:00:00"),
            endDate: moment("2019-03-06T08:00:00")
          },
          {
            name: "Terça Feira Carnaval",
            startDate: moment("2020-02-25T08:00:00"),
            endDate: moment("2020-02-26T08:00:00")
          },
          {
            name: "Terça Feira Carnaval",
            startDate: moment("2021-02-16T08:00:00"),
            endDate: moment("2021-02-17T08:00:00")
          },
          {
            name: "Terça Feira Carnaval",
            startDate: moment("2022-03-01T08:00:00"),
            endDate: moment("2022-03-02T08:00:00")
          },
          {
            name: "Terça Feira Carnaval",
            startDate: moment("2023-02-21T08:00:00"),
            endDate: moment("2023-02-22T08:00:00")
          },

          {
            name: "Paixão de Cristo",
            startDate: moment("2019-04-19T08:00:00"),
            endDate: moment("2019-04-20T08:00:00")
          },
          {
            name: "Paixão de Cristo",
            startDate: moment("2020-04-10T08:00:00"),
            endDate: moment("2020-04-11T08:00:00")
          },
          {
            name: "Paixão de Cristo",
            startDate: moment("2021-04-02T08:00:00"),
            endDate: moment("2021-04-03T08:00:00")
          },
          {
            name: "Paixão de Cristo",
            startDate: moment("2022-04-15T08:00:00"),
            endDate: moment("2022-04-16T08:00:00")
          },
          {
            name: "Paixão de Cristo",
            startDate: moment("2023-04-07T08:00:00"),
            endDate: moment("2023-04-08T08:00:00")
          },

          {
            name: "Corpus Christi",
            startDate: moment("2019-06-20T08:00:00"),
            endDate: moment("2019-06-21T08:00:00")
          },
          {
            name: "Corpus Christi",
            startDate: moment("2020-06-11T08:00:00"),
            endDate: moment("2020-06-12T08:00:00")
          },
          {
            name: "Corpus Christi",
            startDate: moment("2021-06-03T08:00:00"),
            endDate: moment("2021-06-04T08:00:00")
          },
          {
            name: "Corpus Christi",
            startDate: moment("2022-06-16T08:00:00"),
            endDate: moment("2022-06-17T08:00:00")
          },
          {
            name: "Corpus Christi",
            startDate: moment("2023-06-08T08:00:00"),
            endDate: moment("2023-06-09T08:00:00")
          }
        ],
        day => ({ ...day, isSystemHoliday: true })
      );
      lodash.forEach([2019, 2020, 2021, 2022, 2023], year =>
        lodash.forEach(recurringHolidays, day =>
          data.holidays.push({
            ...day,
            startDate: moment(day.startDate).year(year),
            endDate: moment(day.endDate).year(year)
          })
        )
      );
    }
    return context;
  };
};
