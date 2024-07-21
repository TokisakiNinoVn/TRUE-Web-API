//stringdate: DD/MM/YYYY
const toDate = (strDate) => {
  if (strDate == "") return null;
  const [day, month, year] = strDate.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date;
};
//stringdate: DD/MM/YYYY HH:mm
const toDateTime = (strDateTime) => {
  const [day, month, year, hour, minute] = strDateTime.match(/\d+/g);
  return new Date(year, month - 1, day, hour, minute);
};

const timeStampToDate = (timestamp) => {
  return new Date(timestamp);
};

module.exports = {
  toDate,
  toDateTime,
  timeStampToDate,
};
