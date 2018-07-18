// create uuid
function create_uuid() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
}

// format JPY
function formatCurrency(val) {
	num = parseInt(val);
	return isNaN(num) ? val : (num.toLocaleString('en-US') + "円");
}

// format Date
function formatDate(dt) {
	var dd = dt.getDate();
	var mm = dt.getMonth() + 1;
	var yy = dt.getFullYear();

	if (dd < 10) { dd = '0' + dd; }
	if (mm < 10) { mm = '0' + mm; }

	return yy + '-' + mm + '-' + dd;
}
