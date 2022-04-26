function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  var temp={};
  var temp2=[year,month,day,hour,minute,second].map(formatNumber);
  temp['year'] = temp2[0]
  temp['month'] = temp2[1]
  temp['day'] = temp2[2]
  temp['hour'] = temp2[3]
  temp['minute'] = temp2[4]
  temp['second'] = temp2[5]

  return temp;
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
}