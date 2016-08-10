config = {
    api: "http://127.0.0.1:9000/",
	authUrl: "http://127.0.0.1:9000/auth.php",
	dataGroups: ["tunnel_house"],
	surveyStartDate: "0001-01-01"
};

sessionGlobals={};

function UI_DataHList(data, dataGroups, api) {
	var container = $("<div/>").addClass("data-view-list");

	function _draw(data) {
		data.forEach(function(item, index) {
			/*var datapointRow = $('<a class="datapoint"></a>').click(function(e) {
				context = $(this);
				context.toggleClass("active");
				if ($(this).hasClass("content-ready")) {
					return;
				}
				

				$.ajax({
					url: api + "download.php?emis=" + item["emis"],
					success: function(list) {
						$("<iframe class='hidden' src='output/"+item["emis"]+".pdf'>").appendTo("body");
						
					}
				});



			});*/

			var datapointRow = $('<span class="datapoint"></span>')/*.append($("<a class='pdf-export'>PDF</a>").attr({
				href: api + "download.php?emis=" + item["emis"]+"&key="+sessionGlobals["key"]+(sessionGlobals["surveyor_id"]?("&surveyor_id="+sessionGlobals["surveyor_id"]):""),
				target: "_blank"
			})))*/.append($("<a class='webpage-view'>HTML</a>").attr({
				href: api + "view.php?emis=" + item["emis"]+"&key="+sessionGlobals["key"]+(sessionGlobals["surveyor_id"]?("&surveyor_id="+sessionGlobals["surveyor_id"]):""),
				target: "_blank"
			}));

			datapointRow.append($('<span></span>').attr({
				"class": "emis"
			}).text(item["emis"]));
			datapointRow.append($('<span></span>').attr({
				"class": "date"
			}).text(item["submission-date"]));
			datapointRow.append($('<span></span>').attr({
				"class": "surveyor-id"
			}).text(item["surveyor-id"]));

			var triggerContainer = $("<span class='ui-trigger-container'/>").appendTo(datapointRow);
			var hListContainer = $("<div class='ui-hlist-container'/>").appendTo(datapointRow).click(function(e) {
				e.stopPropagation();
			});



			/*dataGroups.forEach(function(item_1, index_1) {
				triggerContainer.append($('<a></a>').attr({
					"class": item_1 + " icon"
				}).click(function(e){

					$.ajax({
						url: api+"download.php?emis="+item["emis"]+"&group="+item_1.replace("-","_"),
						success: function(list){
							console.log(hListContainer);
							list = list.split(",");
							new UI_HList(list, {
								api: api,
								suffix: "html"
							}).appendTo(hListContainer.find(".group-"+item_1));
							datapointRow.addClass(item_1+"-downloaded");
						}
					});
					
				}));
				hListContainer.append("<div class='group-"+item_1+"'><h4>"+item_1+"</h4></div>");
			});*/
			container.append(datapointRow);
		});
	}

	function _update(data) {
		container.empty();
		_draw(data);
	}

	this.update = function(data) {
		return _update(data);
	}

	_draw(data);


	$.extend(true, this, container);
}

function UI_DateRangeAndString(options) {

	var context = this;

	var container = $("<div/>").addClass("ui-date-range-and-string-search");
	var stringField = $("<input class='ui-searchbox' type='text' placeholder='Enter ONA ID to filter the list below'/>").appendTo(container);
	var startDateField = $("<input class='ui-start-date' type='date'/>").appendTo(container);
	var endDateField = $("<input class='ui-end-date' type='date'/>").appendTo(container);
	startDateField[0].value = options["default-start-date"];
	endDateField[0].value = options["default-end-date"];
	$.extend(true, this, container);

	$(container).find("input[type='date']").change(function(e) {
		options["event-handlers"]["on-query"].call(context, e);
	});
	$(container).find("input[type='text']").keyup(function(e) {
		options["event-handlers"]["on-query"].call(context, e);
	});

	/*startDateField.change(function(e){
		options["event-handlers"]["on-date-pick"].call(context, e);
	});
	endDateField.change(function(e){
		options["event-handlers"]["on-date-pick"].call(context, e);
	});*/

	function _getQueryObject() {
		return {
			"string": stringField[0].value,
			"start-date": new Date(startDateField[0].value).toJSON().split("T")[0],
			"end-date": new Date(endDateField[0].value).toJSON().split("T")[0]
		};
	}

	this.getQueryObject = function() {
		return _getQueryObject();
	}

	return;
}

function UI_LoginPrompt(options) {
	var container = $("<div class='alert-box'></div>");
	var userName = $("<input type='text' class='username' placeholder='username'/>").appendTo(container);
	var passwordBox = $("<input type='password' class='password' placeholder='password'/>").appendTo(container);



	function _submit() {
		$.ajax({
			url: options.authUrl,
			data: {
				"auth1": userName.val(),
				"auth2": CryptoJS.AES.encrypt(passwordBox.val(), passwordBox.val()).toString()
			},
			success: function(data) {
				if (!Boolean(JSON.parse(data)['authorized'])) {
					alert("Invalid Credentials!");
				} else {
					options.eventHandlers.authorized(JSON.parse(data)['session']);
				}
			},
			method: "POST",
            crossDomain: true
		});
	}

	passwordBox.keyup(function(e) {
		if (e.keyCode === 13) {
			_submit();
		}
	});
	var submitButton = $("<a class='ui-button'>Login</a>").click(function() {
		_submit();
	}).appendTo(container);

	return $.extend(this, container);
}

/* following code no longer relevant:
function UI_HList(data, options) {
	var container = $("<div/>").addClass("ui-hlist");
	if (data.length) {
		dataCleaned = [];

		data.forEach(function(item, index) {
			if (!(dataCleaned.indexOf(item) + 1)) {
				dataCleaned.push(item);
			}
		});

		data = dataCleaned;


		data.forEach(function(item, index) {
			($("<a class='ui-hlist-item'/>").attr({
				href: options.api + item + options.suffix,
				target: "_blank"
			}).text(item)).appendTo(container);
		});
	} else {
		$("<span class='ui-text-na'>Not Found.</span>").appendTo(container);
	}
	$.extend(true, this, container);
	return;
}
*/

function jsonArraySearch(jsonArray, queryString, options) {
	var searchResult = [];
	jsonArray.forEach(function(item, index) {
		var keys = Object.keys(item);
		for (c in keys) {
			var index_1 = keys[c];
			var item_1 = item[index_1];
			if (options["key-value-in-range"]) {
				if (item[options["key-value-in-range"]["key"]] >= options["key-value-in-range"]["range-start"] && item[options["key-value-in-range"]["key"]] <= options["key-value-in-range"]["range-end"] && item_1.toString().match(new RegExp(queryString, "gi"))) {
					searchResult.push(item);
					break;
				}
			} else {
				if (item_1.toString().match(new RegExp(queryString, "gi"))) {
					searchResult.push(item);
					break;
				}
			}
		}
	});
	return searchResult;
}

$(document).ready(function() {

	var dataSet = [];

	var uiDataHList;

	var loginPromptContainer = $("<div id='login-prompt'><h4 class='msg'>Please login to continue..</h4></div>").appendTo("body");

	new UI_LoginPrompt({
		authUrl: config.authUrl,
		eventHandlers: {
			authorized: function(session) {
				sessionGlobals={
					"surveyor_id": session["surveyor_id"],
					"key": session["key"]
				};
				loginPromptContainer.remove();
				init();
			}
		}
	}).appendTo(loginPromptContainer);

	function init() {

		$.ajax({
			url: config.api + "download.php"+"?key="+sessionGlobals["key"]+(sessionGlobals["surveyor_id"]?("&surveyor_id="+sessionGlobals["surveyor_id"]):""),
            crossDomain: true,
			success: function(data) {
				data = data.split("|");
				data[0] = data[0].split(";");
				data[1] = data[1].split(";");
				data[2] = data[2].split(";");

				//console.log(data);

				data[0].forEach(function(item, index) {
					dataSet.push({
						"emis": item,
						"submission-date": data[1][index],
						"surveyor-id": data[2][index]
					});
				});

				uiDataHList = new UI_DataHList(jsonArraySearch(dataSet, "", {
					"key-value-in-range": {
						"key": "submission-date",
						"range-start": new Date(new Date() - 31536000000).toJSON().split("T")[0],
						"range-end": new Date().toJSON().split("T")[0]
					}
				}), config.dataGroups, config.api);

				$("#app").append(uiDataHList);
			}
		});

		uiQueryField = new UI_DateRangeAndString({
			"default-start-date": new Date(new Date() - 31536000000).toJSON().split("T")[0],
			"default-end-date": (new Date()).toJSON().split("T")[0],
			"event-handlers": {
				"on-query": function(e) {

					//console.log(new Date(this.getQueryObject()["end-date"]) - new Date(this.getQueryObject()["start-date"]));

					if (new Date(this.getQueryObject()["end-date"]) - new Date(this.getQueryObject()["start-date"]) > 31536000000) {
						$(".ui-large-button.with-pictures").addClass("passive");
						$(".ui-large-button.with-pictures").parent().addClass("passive");
					} else {
						$(".ui-large-button.with-pictures").removeClass("passive");
						$(".ui-large-button.with-pictures").parent().removeClass("passive");
					}

					uiDataHList.update(jsonArraySearch(dataSet, this.getQueryObject().string, {
						"key-value-in-range": {
							"key": "submission-date",
							"range-start": this.getQueryObject()["start-date"],
							"range-end": this.getQueryObject()["end-date"]
						}
					}));
				}
			}
		});

		uiQueryField.appendTo("#app");
		//uiQueryField.onManifest();

		var updateMsgBox = $("<div class='update-msg'></div>").appendTo("#app");
		$.ajax({
			url: config.api + "download.php?query=gettimestamp"+"&key="+sessionGlobals["key"]+(sessionGlobals["surveyor_id"]?("&surveyor_id="+sessionGlobals["surveyor_id"]):""),
            crossDomain: true,
			success: function(data) {
				data = Number(data);
				updatetime = "Last update: " + Math.floor(data / 3600) + "h" + Math.floor((data / 3600 - Math.floor(data / 3600)) * 60) + "m ago.";
				updateMsgBox.text(updatetime);
				setInterval(function() {
					updatetime = "Last update: " + Math.floor(data / 3600) + "h" + Math.floor((data / 3600 - Math.floor(data / 3600)) * 60) + "m ago.";
					updateMsgBox.text(updatetime);
					data += 60;
				}, 60000);
			}
		});

		if (!navigator.userAgent.match(/chrome/i)) {
			uiQueryField.find(".ui-start-date").datepicker({
				format: "yy-mm-dd"
			}).datepicker("setDate", new Date(config.surveyStartDate));
			uiQueryField.find(".ui-end-date").datepicker({
				format: "yy-mm-dd"
			}).datepicker("setDate", new Date());
		}

		$("<div class='ui-raw-download-list'/>").append(function() {
			return $("<a class='ui-large-button with-pictures'>Download Data (Including Photographs)</a>").click(function(e) {
				var context = this;
				$.ajax({
					url: config.api + "script.php?tablename=school&startdate=" + uiQueryField.getQueryObject()["start-date"] + "&enddate=" + uiQueryField.getQueryObject()["end-date"] + "&string=" + uiQueryField.getQueryObject()["string"]+"&key="+sessionGlobals["key"]+(sessionGlobals["surveyor_id"]?("&surveyor_id="+sessionGlobals["surveyor_id"]):""),
                    crossDomain: true,
					success: function(filename) {
						$(context).parent().find("a.ui-hlist").remove();
						if (filename === "") {
							$(context).parent().append($("<a class='ui-hlist-item error'/>").text("Date range too large. Please try a smaller range of dates."));
						} else {
							$(context).parent().append($("<a class='ui-hlist-item' target='_blank'/>").attr({
								href: config.api +"downloads/"+sessionGlobals["key"].split('-')[1]+"/"+ filename
							}).text(filename));
							
						}

						$.ajax({
							url: config.api + "script.php?tablename=building&startdate=" + uiQueryField.getQueryObject()["start-date"] + "&enddate=" + uiQueryField.getQueryObject()["end-date"] + "&string=" + uiQueryField.getQueryObject()["string"]+"&key="+sessionGlobals["key"]+(sessionGlobals["surveyor_id"]?("&surveyor_id="+sessionGlobals["surveyor_id"]):""),
                            crossDomain: true,
							success: function(filename) {
								//$(context).parent().find("a.ui-hlist").remove();
								if (filename === "") {
									$(context).parent().append($("<a class='ui-hlist-item error'/>").text("Date range too large. Please try a smaller range of dates."));
								} else {
									$(context).parent().append($("<a class='ui-hlist-item' target='_blank'/>").attr({
										href: config.api +"downloads/"+sessionGlobals["key"].split('-')[1]+"/"+ filename
									}).text(filename));
									
								}

								$.ajax({
									url: config.api + "script.php?tablename=buildingelement&startdate=" + uiQueryField.getQueryObject()["start-date"] + "&enddate=" + uiQueryField.getQueryObject()["end-date"] + "&string=" + uiQueryField.getQueryObject()["string"]+"&key="+sessionGlobals["key"]+(sessionGlobals["surveyor_id"]?("&surveyor_id="+sessionGlobals["surveyor_id"]):""),
                                    crossDomain: true,
									success: function(filename) {
										//$(context).parent().find("a.ui-hlist").remove();
										if (filename === "") {
											$(context).parent().append($("<a class='ui-hlist-item error'/>").text("Date range too large. Please try a smaller range of dates."));
										} else {

											$(context).parent().append($("<a class='ui-hlist-item' target='_blank'/>").attr({
												href: config.api +"downloads/"+sessionGlobals["key"].split('-')[1]+"/"+ filename
											}).text(filename));
											
										}
									}
								});
							}
						});
					}
				});


			})
		});//.appendTo("#app");


		$("<div class='ui-raw-download-list'/>").append(function() {
			return $("<a class='ui-large-button'>Download CSV Only</a>").click(function(e) {
				var context = this;
				$.ajax({
					url: config.api + "script.php?tablename=school&startdate=" + uiQueryField.getQueryObject()["start-date"] + "&enddate=" + uiQueryField.getQueryObject()["end-date"] + "&query=csvonly"+"&key="+sessionGlobals["key"]+(sessionGlobals["surveyor_id"]?("&surveyor_id="+sessionGlobals["surveyor_id"]):""),
                    crossDomain: true,
					success: function(filename) {
						$(context).parent().find("a.ui-hlist").remove();
						if (filename === "") {
							$(context).parent().append($("<a class='ui-hlist-item error'/>").text("Date range too large. Please try a smaller range of dates."));
						} else {
							$(context).parent().append($("<a class='ui-hlist-item' target='_blank'/>").attr({
								href: config.api + filename.replace(".zip", ".csv")+"?key="+sessionGlobals["key"]
							}).text(filename.replace(".zip", ".csv")));
							
						}

						$.ajax({
							url: config.api + "script.php?tablename=building&startdate=" + uiQueryField.getQueryObject()["start-date"] + "&enddate=" + uiQueryField.getQueryObject()["end-date"] + "&query=csvonly"+"&key="+sessionGlobals["key"]+(sessionGlobals["surveyor_id"]?("&surveyor_id="+sessionGlobals["surveyor_id"]):""),
                            crossDomain: true,
							success: function(filename) {
								//$(context).parent().find("a.ui-hlist").remove();
								if (filename === "") {
									$(context).parent().append($("<a class='ui-hlist-item error'/>").text("Date range too large. Please try a smaller range of dates."));
								} else {
									$(context).parent().append($("<a class='ui-hlist-item' target='_blank'/>").attr({
										href: config.api + filename.replace(".zip", ".csv")+"?key="+sessionGlobals["key"]
									}).text(filename.replace(".zip", ".csv")));
									
								}

								$.ajax({
									url: config.api + "script.php?tablename=buildingelement&startdate=" + uiQueryField.getQueryObject()["start-date"] + "&enddate=" + uiQueryField.getQueryObject()["end-date"] + "&query=csvonly"+"&key="+sessionGlobals["key"]+(sessionGlobals["surveyor_id"]?("&surveyor_id="+sessionGlobals["surveyor_id"]):""),
									crossDomain: true,
                                    success: function(filename) {
										//$(context).parent().find("a.ui-hlist").remove();
										if (filename === "") {
											$(context).parent().append($("<a class='ui-hlist-item error'/>").text("Date range too large. Please try a smaller range of dates."));
										} else {

											$(context).parent().append($("<a class='ui-hlist-item' target='_blank'/>").attr({
												href: config.api + filename.replace(".zip", ".csv")+"?key="+sessionGlobals["key"]
											}).text(filename.replace(".zip", ".csv")));
											
										}
									}
								});
							}
						});
					}
				});


			})
		});//.appendTo("#app");



	}



	$("#export-tab").click(function() {
		$(".data-view-list").remove();
		//$("#app").append($(new UI_DataExportTool(datalist, config.dataGroups, config.api)));
	});

	$("#view-tab").click(function() {
		$(".data-export-tool").remove();
		$("#app").append($(new UI_DataHList(dataSet, config.dataGroups, config.api)));
	});



});
