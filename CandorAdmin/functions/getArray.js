export default (yearObj) => {
  var months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  let arr = [];

  Object.keys(yearObj).map(function (key1, index) {
    Object.keys(yearObj[key1].months).map(function (key, index) {
      arr.push({ y: yearObj[key1].months[key].total, x: months[key - 1] });
    });
  });

  return arr;
};
