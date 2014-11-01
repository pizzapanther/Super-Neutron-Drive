function dayTimeStamp () {
  var d = new Date();
  d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  return parseInt((Date.now() - d.getTime()) / 1000);
}