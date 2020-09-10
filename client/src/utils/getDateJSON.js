import moment from "moment";

const getDateJSON = ({ date }) => {
  const dateD = moment(date);
  return {
    year: dateD.year(),
    month: dateD.month(),
    date: dateD.date(),
    hour: dateD.hour(),
    minute: dateD.minute(),
    second: dateD.second()
  };
};

export default getDateJSON;
