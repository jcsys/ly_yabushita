// dialog box 
function dialog_show(title, msg, action_ok, action_ng) {
	$('#dialog-box .modal-title').text(title);
	$('#dialog-box .modal-body').html(msg);
	$('#dialog-box .btn-primary').unbind('click');
	$('#dialog-box .btn-primary').click(function(ev){
		if (action_ok) action_ok();
		$('#dialog-box').modal('hide');
		ev.preventDefault();
	});
	$('#dialog-box .btn-secondary').unbind('click');
	$('#dialog-box .btn-secondary').click(function(ev){
		if (action_ng) action_ng();
		$('#dialog-box').modal('hide');
		ev.preventDefault();
	});
	$('#dialog-box').modal('show');
}

function dialog_window_close() {
	$('#dialog-window').modal('hide');
}

function dialog_window_open(title, src) {
	$('#dialog-window .modal-title').text(title);
	$('#dialog-window iframe').attr('src', src);
	$('#dialog-window').modal('show');
}
