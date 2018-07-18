var stationlines = null;

// enter action
var $elementsTab = null;

function init_set_enter_action(action_type) {
	$elementsTab = $("input,select,textarea,a,button");

	$("input,input,select").keypress(function (e) {
		var keycode = e.which ? e.which : e.keyCode;

		if (keycode == 13) {
			if ($(this).attr('type') == 'button') {

			} else if (action_type == 0) {	// 動作禁止
				e.preventDefault();
				return false;
			} else {	// TAB移動
				var tabindex = $(this).attr("tabindex");
				
				if (typeof (tabindex) != "undefined" && $("[tabindex='" + (tabindex - 0 + 1) + "']").size() > 0) {
					$("[tabindex='" + (tabindex - 0 + 1) + "']").focus();
				} else {
					var index = $elementsTab.index(this);
					$elementsTab.eq(index + 1).focus();
				}
				e.preventDefault();				
			}
		}
	});
}

// bank auto complate
function init_bank_autocomplete(target_elem) {
	$(target_elem).autocomplete({
		minLength: 1,
		source: function(request, response) {
			$.getJSON("/data/bank/search/10/" + request.term, function(data) {
				response(data.slice(0, 10));
			});
		},
		select: function(event, ui) { $(target_elem).val(ui.item.value); return false; },
		focus: function(event, ui) { $(target_elem).val(ui.item.value); return false; }
	}).autocomplete("instance")._renderItem = function(ul, item) {
		return $("<li><div>" + item.value + "</div></li>").appendTo(ul);
	};
}

// house auto complate
function init_house_autocomplete(target_elem, search_url) {
	$(target_elem).autocomplete({
		minLength: 1,
		source: function(request, response) {
			$.getJSON("/data/house/search/10/" + request.term, function(data) {
				response(data.slice(0, 10));
			});
		},
		select: function(event, ui) { window.location = search_url + ui.item.Id; },
		focus: function(event, ui) { $(target_elem).val( ui.item.No ); return false; }
	}).autocomplete("instance")._renderItem = function(ul, item) {
		return $("<li><div class='autocomplate-item W400'><span>" + item.No + "</span>" + item.Name + "</div></li>").appendTo(ul);
	};
}

// Post Code
function init_post_address(target_post, target_address) {
	target_post.bind("change keyup paste", function() {
		var newValue = target_post.val();
		var ps = newValue.replace('-', '');

		if (ps.length < 7) return;

		var ps_l = ps.substring(0, 3);
		var ps_r = ps.substring(3, 7);

		target_post.val(ps_l + '-' + ps_r);

		$.ajax({
			type: 'GET',
			url: 'https://madefor.github.io/postal-code-api/api/v1/' + ps_l + '/' + ps_r + '.json',
			dataType: 'json',
			success: function(data) {
				dt = data.data[0].ja;
				target_address.val(dt.prefecture + dt.address1 + dt.address2);
			},
			error: function() {
				target_address.val('');
			}
		});
	});
}

// Station & Lines
function init_station_lines(target_lines, target_stations, station_id) {
	// get station lines
	if (stationlines == null) {
		$.getJSON('/data/station/list', function(data) {
			stationlines = data;
			init_station_lines_set_default(target_lines, target_stations, station_id);
		});
	} else {
		init_station_lines_set_default(target_lines, target_stations, station_id);
	}

	// get stations
	target_lines.bind("change", function() {
		init_station_lines_set_stations(target_stations, parseInt(target_lines.val(), 10));
	});
}

function init_station_lines_set_stations(target, line_id) {
	target.children().remove();
	target.val(0);
	
	if (line_id != 0) {
		$.each(stationlines, function(lkey, lval) {
			if (parseInt(lval.Id, 10) == line_id) {
				$.each(lval.Stations, function(skey, sval) {
					target.append('<option value="' + sval.Id + '">' + sval.Name + '</option>');
				});

				return true;
			}
		});
	}
}

function init_station_lines_set_default(target_lines, target_stations, station_id) {
	if (target_lines.children().length == 0) {
		target_lines.append('<option value="0"></option>');

		$.each(stationlines, function(key, val) {
			target_lines.append('<option value="' + val.Id + '">' + val.Name + '</option>');
		});
	}

	$.each(stationlines, function(lkey, lval) {
		$.each(lval.Stations, function(skey, sval) {
			if (parseInt(sval.Id, 10) == station_id) {
				target_lines.val(sval.LineId);

				init_station_lines_set_stations(target_stations, sval.LineId);
				target_stations.val(station_id);

				station_id = -1;
				return true;
			}
		});

		if (station_id == -1) return false;
	});
}

// カスタマイズページング
function init_pagging(elem_pagging, data_list, page_size, cb_pagging, cb_item) {
	// nullの場合はからへ
	data_list = data_list || [];

	var page = new ospage(elem_pagging, data_list.length, function(pageIndex, pageCount, oneSize, allSize) {
			if (cb_pagging) cb_pagging();

			for (var i = 0; i < oneSize; i++) {
				var idx = (pageIndex -1) * oneSize + i;
				if (idx < 0 || idx >= data_list.length) return;

				if (cb_item) cb_item(data_list[idx]);
			}
		}, {
			first: "|<",
			previous: "<",
			next: ">",
			last: ">|",
			pageIndex: 1,
			pageSize: page_size,
			blockCount: 5
		}
	);
}

// カスタマImage Picker
function init_image_picker(imgUploader, imgProgress) {
	var webUploader = new WebUploader.Uploader({
		pick: {
			id: imgUploader
		},		
		accept: {
			title: "Images",
			extensions: "gif,jpg,jpeg,bmp,png",
			mimeTypes: "image/*",
		},
		thumb: {
			width: 160,
			height: 120,
			quality: 100,
			allowMagnify: true,
			crop: true,
			type: "image/jpeg",
		},
		auto: true,
		compress: false,
		method: "POST",
		server:'/data/image/upload',
	});

	if (!WebUploader.Uploader.support()) {
		alert('該当Explorerはサポートしません!');
		return null;
	}

	webUploader.on('fileQueued', function(file) {				
		webUploader.makeThumb(file, function(error, dataSrc) {
			if (error) {
				imgProgress(0, file, 0, "");
			} else {
				imgProgress(0, file, 0, dataSrc);
			}
		});
	});

	webUploader.on('uploadProgress', function(file, percentage) {
		imgProgress(1, file, percentage, "");
	});

	webUploader.on('uploadSuccess', function(file, response) {
		imgProgress(2, file, 1.0, response);
	});

	webUploader.on('uploadError', function(file, reason) {
		imgProgress(-1, file, 0, 'upload failed!');
	});

	webUploader.on('error', function(code) {
		switch (code) {
		case 'F_DUPLICATE':			alert('ファイルは既に存在です!');			break;
		case 'F_EXCEED_SIZE':		alert('ファイルサイズオーバー!');			break;
		case 'Q_EXCEED_NUM_LIMIT':	alert('ファイル数オーバー!');				break;
		case 'Q_EXCEED_SIZE_LIMIT':	alert('ファイル総サイズオーバー!');			break;
		case 'Q_TYPE_DENIED':		alert('該当ファイルは対象外です!');			break;
		case 'UNSUPPORT_EXPLORER':	alert('該当Explorerはサポートしません!');	break;
		default:					alert('不明エラー!');						break;
		}
	});

	return webUploader;
}

// calendar
function init_calendar(elmLoading, elmCalendar) {
	moment.updateLocale("ja", {
		weekdays: ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],
		weekdaysShort: ["日","月","火","水","木","金","土"],
	});

	$(elmLoading).fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay,listMonth'
		},
		navLinks: true,
		businessHours: true,
		editable: false,
		locale: 'ja',
		events: {
			url: '/data/cal',
			error: function() {
				console.log("load calendar data error...");
			}
		},
		loading: function(bool) {
			$(elmCalendar).toggle(bool);
		}
	});
}

// メニューステータス
function init_memu_state() {
	var sidebar_state = window.localStorage.getItem('sidebar_state');
	if (sidebar_state == "true") {
		$('body').addClass('sidebar-collapse');
	} else {
		$('body').removeClass('sidebar-collapse');
	}
}

$(document).ready(function() {
	$(document).on('click', '[data-toggle="push-menu"]', function(e) {
		e.preventDefault();
		window.localStorage.setItem('sidebar_state', $('body').hasClass('sidebar-collapse'));
	});
});