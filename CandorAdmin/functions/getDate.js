export default (unixtimestamp) => {
  // Months array
  var months_arr = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Convert timestamp to milliseconds
  var date = new Date(unixtimestamp * 1)

  // Year
  var year = date.getUTCFullYear();

  // Month
  var month = months_arr[date.getMonth()];

  // Day
  var day = date.getDate();

  // Hours
  var hours = date.getHours();

  // Minutes
  var minutes = "0" + date.getMinutes();

  // Seconds
  var seconds = "0" + date.getSeconds();

  // Display date time in MM-dd-yyyy h:m:s format
  var fulldate =
    month +
    " " +
    day +
    "-" +
    year +
    " " +
    hours +
    ":" +
    minutes.substr(-2) +
    ":" +
    seconds.substr(-2);

  // final date
  var convdataTime = day + " " + month + ", " + year;
  return convdataTime;
};
