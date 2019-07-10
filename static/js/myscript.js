function checkBrowser() {//浏览器检查
	if(navigator.userAgent.indexOf("Firefox") == -1 ) {
		event.preventDefault();
	}
}
var xhttp = new XMLHttpRequest();
var openc2command = {
	"action": "",
	"target": {},
};
var codes = [];
var valueTypes = {};
var jsonjadn = new Array();
var allTargets = [];

$(document).ready(function () {

	function dropdownItem() {//显示所选择的选项，例如显示action为stop
			$('.dropdown-item').on('click', (function (event) {
				checkBrowser(event);
			switch (($(this).attr('class').split(' '))[1]) {
				case 'actionDropDownMenu'://显示所选择的action
					actionFunction(this.text);
					break;
				case 'targetDropDownMenu'://显示所选择的target
					targetFunction(this.text);
					break;
				case 'actuatorDropDownMenu'://显示所选择的actuator
					actuatorFunction(this.text);
					break;
				default:
					break;
			}
		}));
	};

	function populateFields() {//加载json文件，形成每个字段的可选项下拉栏，例如字段action的一系列可选项
		var jsonjadn = $.getJSON("static/openc2-slpf-4.json", function (data) {//加载json文件
			$.each(jsonjadn.responseJSON.types, function (i, item) {
				valueTypes[item[0]] = item[1];//加载各个字段的类型，例如valueTypes[Action] = Enumerated;即action的类型为Enumerated
			});
			var unsortedActions = jsonjadn.responseJSON.types[4][4]; //retrieves actions
			codes['encryption_algorithm'] = jsonjadn.responseJSON.types[28][4];//加载字段encryption_algorithm的可选项值
			codes['hashes'] = jsonjadn.responseJSON.types[17][4];//加载字段hashes的可选项值
			var allUnsortedActions = [];//暂存排序之前的action
			i = 0;
			while (i < unsortedActions.length) {
				allUnsortedActions.push(unsortedActions[i][1]);//暂存排序之前的action
				i++;
			}
			var allActions = allUnsortedActions.sort();//排序
			allTargets = ["null"];//target初始化，由于未选择action，所以target显示null
			var allActuators = jsonjadn.responseJSON.types[6][4];

			$.each(allActions, function (i, item) {//遍历allactions,显示所有的action
				$('#actionId').append('<a class="dropdown-item actionDropDownMenu" role="presentation" href="#" id=' + item + "SelectionId" + '>' + item + '</a>');
			});
			$.each(allTargets, function (i, item) {//遍历allTargets,显示所有的target
				$('#targetId').append('<a class="dropdown-item targetDropDownMenu" role="presentation" href="#" id=' + item + "SelectionId" + '>' + item + '</a>');
			});
			$.each(allActuators, function (i, item) {//遍历allActuators,显示所有的actuator
				$('#actuatorId').append('<a class="dropdown-item actuatorDropDownMenu" role="presentation" href="#" id=' + item[1] + "SelectionId" + '>' + item[1] + '</a>');
			});
			dropdownItem();
			targetSelect(jsonjadn);
			targetDropDown(jsonjadn);
		});

	}

	function targetSelect(jsonjadn) {//选择target及其属性
		$('.actionDropDownMenu').on('click',function (event) {
			checkBrowser();
			$('#targetButtonId').text('target');//将id为targetButtonId处初始化，显示target字样。
	        openc2command['target']={}//初始化
	        $.each(allTargets,function (i,item) {//移除原有的target
			    $('#'+item+'SelectionId').remove();
		    });
	        $('.targetUpdateRow').remove();
	        $('#targetOptionButtonId').remove();
	        $.each(jsonjadn.responseJSON.types[4][4],function (i,v) {
	        	var valueT = actionButtonId.innerText;//获取action的值
	        	if(valueT==v[1]){
	        		allTargets=v[3];//根据action的值获取target的值
	        		$.each(allTargets, function (i, item) {//遍历allTargets,显示所有的target
			            $('#targetId').append('<a class="dropdown-item targetDropDownMenu" role="presentation" href="#" id=' + item + "SelectionId" + '>' + item + '</a>');
		            });
	        		dropdownItem();
	        		targetDropDown(jsonjadn);
				}
            })
        })
	};

	function targetDropDown(jsonjadn) {//显示所选target的所有说明符，即target下所需的属性
		$('.targetDropDownMenu').on('click', function (event) {
			checkBrowser();
			$.each(jsonjadn.responseJSON.types, function (i, v) {
				var valueT = targetButtonId.innerText;
				if (v[0] == valueT && (v[1] == 'Map' || v[1] == 'Record' || v[1] == 'Choice')) {//若target类型为以上三类，作如下处理
					$('.targetUpdateRow').remove();
					$('#targetOptionButtonId').remove();
					$('.targetRow').after('<tr class="targetUpdateRow"><td>当前目标所需参数：</td><td><div> <div id="targetOptionButtonId">' + v[0].toUpperCase() + ' Options</div>');
					singleInputTargetRow(v);
				}
				if (v[0] == valueT && v[1] == 'String') {//若target类型为string，则作如下处理
					$('.targetUpdateRow').remove();
					$('#targetOptionButtonId').remove();
					$('.targetRow').after('<tr class="targetUpdateRow"><td>当前目标所需参数：</td><td><div> <div id="targetOptionButtonId">' + v[0].toUpperCase() + ' Options</div>');
					$('#targetOptionButtonId').after('<tr><td><div class="form"><label for="' + valueT + 'formCheck" >' + valueT + '</label></div></td><td id="' + valueT + '_TD"><input class="inputString" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + valueT + '" onchange="updateInputValues(this)" id="' + valueT + '_inputString" type="text" minlength="1" tabindex="-1"/>	</td></tr>');
					if ('data' != 'data') {
						$('#targetOptionButtonId').after('<input class="dropdown-item" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + valueT + '" onchange="updateValues(this)" id="' + valueT + '_inputString" type="text" minlength="1" tabindex="-1"/>	</td></tr>');
					}
				}
			});
		});
	};

	function singleInputTargetRow(v) {//若target的说明符含有encryption_algorithm或者hashes，则作如下处理
		$.each(v[4], function (j, w) {
			asteriskChecker = asteriskCheck(w);//目标说明符名称
			if (w[1] == 'encryption_algorithm') {
				$('#targetOptionButtonId').after('<tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + asteriskChecker + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' onclick="dynamicInputCheck(this)"/><label for="' + asteriskChecker + 'formCheck" >' + asteriskChecker + '</label></div></td><td id="' + w[1] + '_TD"><div class="dropdown" id="' + asteriskChecker + "_MenuList" + '"><button class="btn btn-light dropdown-toggle" data-toggle="dropdown" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '"  id="' + asteriskChecker + '_inputString" type="dropdown" tabindex="-1" aria-expanded="false" type="button" >' + w[1] + '</button></div></div></td></tr>');
				$('#' + asteriskChecker + "_MenuList").append('<div class="dropdown-menu asteriskChecker_Class" id="' + asteriskChecker + '_Menu"></div>');

				$.each(codes[w[1]], function (i, item) {
					$('#' + asteriskChecker + '_Menu').append('<a class="dropdown-item encryptoDropDownMenu" oc2name="target" oc2checkbox="' + asteriskChecker + '" oc2cmdname="' + $('#targetButtonId')[0].innerText + '" role="presentation" href="#" id=' + item[1] + "SelectionId" + ' onclick="updateValues(this)">' + item[1] + '</a>');
				});
			} else if (w[1] == 'hashes' || (w[1] == 'hash')) {
				$('#targetOptionButtonId').after('<tr id="hashContent"><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + asteriskChecker + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' onclick="dynamicInputCheck(this)"/><label for="' + asteriskChecker + 'formCheck" >' + asteriskChecker + '</label></div></td><td id="' + w[1] + '_TD" class="hashContent"><div class="dropdown" id="' + asteriskChecker + "_MenuList" + '"><button class="btn btn-light dropdown-toggle " data-toggle="dropdown" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '"  id="' + asteriskChecker + '_inputString" type="dropdown" tabindex="-1" aria-expanded="false" type="button" >' + w[1] + '</button></div></div></td></tr>');
				$('#' + asteriskChecker + "_MenuList").append('<div class="dropdown-menu asteriskChecker_Class hashTypes" id="' + asteriskChecker + '_Menu"></div>');

				$.each(codes[w[1]], function (i, item) {
					$('#' + asteriskChecker + '_Menu').append('<a class="dropdown-item encryptoDropDownMenu" oc2name="target" oc2checkbox="' + asteriskChecker + '" oc2cmdname="' + $('#targetButtonId')[0].innerText + '" role="presentation" href="#" id=' + item[1] + "SelectionId" + ' onclick="updateValues(this)">' + item[1] + '</a>');
				});
				$('#' + asteriskChecker + '_TD').after('<td class="hashTypes hashContent"><input class="hashTypes inputString input-disabled' + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '" onchange="updateInputValues(this)" type="text" minlength="1" tabindex="-1" value=""/><i class="hashTypes fa fa-plus-circle hashContent input-disabled" onclick="createNewHashRow(this)" style="color:rgb(40,167,69);font-size:46;"></i></td>');
			} else if (w[1] != 'encryption_algorithm' && w[1] != 'hashes' && w[1] != 'hash' && (w[2] == "Null" || w[2] == "comm-selected")) {
				$('#targetOptionButtonId').after('<tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + asteriskChecker + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' onclick="dynamicInputCheck(this)"/><label for="' + asteriskChecker + 'formCheck" >' + asteriskChecker + '</label></div></td><td id="' + w[1] + '_TD"></td></tr>');
			} else if (w[1] != 'encryption_algorithm' && w[1] != 'hashes' && w[1] != 'hash' && w[2] != "comm-selected") {
				$('#targetOptionButtonId').after('<tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="' + asteriskChecker + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' onclick="dynamicInputCheck(this)"/><label for="' + asteriskChecker + 'formCheck" >' + asteriskChecker + '</label></div></td><td id="' + w[1] + '_TD"><input class="inputString" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '" onchange="updateInputValues(this)" id="' + asteriskChecker + '_inputString" type="text" minlength="1" tabindex="-1" value=""/></td></tr>');
			};

			box = asteriskChecker + '_inputString';
			$('#' + box).addClass('input-disabled');
		});
	}
	populateFields();
});

function getNumber() {
	val = Math.floor(Math.random() * 16)
	return val.toString(16)
}
function get_value(entries) {
	var valueToReturn = 0;
	var i = 0;
	while (i < entries) {
		valueToReturn += getNumber();
		i++;
	}
	return valueToReturn
}
function uuid_VerGet() {
	var uuidver = [8,9,'a','b'];
	return uuidver[Math.floor(Math.random()*uuidver.length)];
}
function getRandomNumber() {//形成随机字符串，作为命令ID
	return get_value(7) + '-' + get_value(3) + '-4' + get_value(2) + '-' + uuid_VerGet() + '' + get_value(2) + '-' + get_value(11)

}


$("#executeNowId").on('click', (function () {//执行发送指令

	var openc2data = openc2command;
	var address = $("#oc2ServerId").val();
	openc2data["address"] = address;
   $.ajax({
           url: "receive",
           type: "post",
           async:true,
		   data: JSON.stringify(openc2data),
           cache:false,
           dataType:"text",
		success: function(status){
			alert("action：" + openc2command['action'] + "\n\n状态：200" + "\n\n响应：" + status);
		},
		error: function(status) {
               alert("action：" + openc2command['action'] + "\n\n状态：" + status["status"] + "\n\n响应：" + status["responseText"]);
		}
	});


}));



$("#resetSelectionsId").on('click', (function () {//重置所有参数
	$('#actuator_id').prop("checked", false);
	$('#asset_id').prop("checked", false);
	$('#actionButtonId').text('action');
	$('#targetButtonId').text('target');
	$('#actuatorButtonId').text('actuator');
	$('#commandSampleContentPre').text('{}');
	$('#commandSampleContentPre').text('{}');
	openc2command = {
		"action": "",
		"target": {}
	};
	$('.targetUpdateRow').remove();
	$('.actuatorSpecifierRow').remove();
	$('#collapse-1').removeClass('show');
	$('#collapse-3').removeClass('show');
	$('.argumentChoice').hide();
    $('.slpfChoice').hide();
    document.getElementById("insert_rule").value="";
    document.getElementById("drop_process").value="";
    document.getElementById("running").value="";
    document.getElementById("direction").value="";
    document.getElementById("duration").value="";
    document.getElementById("start_time").value="";
    document.getElementById("stop_time").value="";
    document.getElementById("response_requested").value="";

}));
$("#generateCodeId").on('click', (function () {
	//openc2command['args']['id'] = getRandomNumber();
	var jsonPrettified = JSON.stringify(openc2command, null, 2);
	$('#commandSampleContentPre').text(jsonPrettified);
	$('#collapse-1').addClass('show');
	$('#collapse-3').addClass('show');
}));

function actionFunction(selectedValue) {//action选择
	$('#actionButtonId').text(selectedValue);
	openc2command['action'] = selectedValue;
}
function targetFunction(selectedValue) {//target选择
	$('#targetButtonId').text(selectedValue);
	if (valueTypes[selectedValue] == 'String') {
		openc2command['target'] = {};
		openc2command['target'][selectedValue] = " ";
	} else if (valueTypes[selectedValue] == 'Map' || valueTypes[selectedValue] == 'Choice' || valueTypes[selectedValue] == 'Record') {
		openc2command['target'] = {};
		openc2command['target'][selectedValue] = {};
	}
}
function actuatorFunction(selectedValue) {//actuator选择
	$('#actuatorButtonId').text(selectedValue);
	openc2command.actuator = JSON.parse('{ "' + selectedValue + '": {}}');
	if ($('#actuatorRow').length == 0) {
		$('.actuatorRow').after('<tr class="actuatorSpecifierRow"><td></td><td><table id="actuatorRow"><tbody><tr><td><div class="form"><input class="dynamicInput" type="checkbox" id="actuator_id" oc2name="actuator_specifier" oc2cmdname="actuator_specifier" onclick="dynamicInputCheck(this)"><label for="actuatorIdCheck">actuator Id</label></div></td><td><input class="inputString input-disabled" oc2name="actuator" oc2checkbox="actuator_id" onchange="updateValues(this)" id="actuator_id_inputString" type="text" minlength="1" tabindex="-1" data-mp-id="actuatorId_inputString"></td></tr></tbody></table></td></tr>');
	}
}

function dynamicInputCheck(test) {//目标说明符名称前的复选框
	var getCurrentValue = $('#actuatorButtonId')[0].innerText;//所选执行器名称
	if (test.checked == true) {//如果选中复选框
		var targetName = test.getAttribute('oc2name');//值为"target"
		var targetOc2name = test.getAttribute('oc2cmdname');//所选目标名称
		var capture = '{ ' + test.id + " : " + "" + '}';//test.id为目标说明符名称
		if (test.id != 'any') {
			$('#' + test.id + '_inputString').removeClass('input-disabled');
			//将id为目标说明符名称+_inputString，且class为input-disabled的HTML语句移除
			$('#' + test.id + '_inputString').attr('readonly', false);
		}
		if (targetName == 'target' && (test.id == 'hashes' || test.id == 'hash')) {
			openc2command[targetName][targetOc2name][test.id] = {};
			$('.hashTypes').removeClass('input-disabled');
			$('#' + test.id + '_inputString').removeAttr('tabindex');
		}
		if (targetName == 'target' && (test.id != 'hashes' || test.id != 'hash')) {//普通情况
			openc2command[targetName][targetOc2name][test.id] = '';
			$('#' + test.id + '_inputString').removeAttr('tabindex');
		}
		if(targetName == 'args' && test.id=='drop_process'){
			openc2command[targetName][targetOc2name]={};
			openc2command[targetName][targetOc2name][test.id] = '';
			$('#' + test.id + '_inputString').removeAttr('tabindex');
		}
		if (targetName == 'actuator_specifier') {
			if (test.id == 'actuator_id') {
				openc2command.actuator[getCurrentValue]['actuator_id'] = "";
			}
			if (test.id == 'asset_id') {
				openc2command.actuator[getCurrentValue]['asset_id'] = "";
			}
			$('#' + test.id + '_inputString').removeAttr('tabindex');
		}
	}
	if (test.checked == false) {
		var targetName = test.getAttribute('oc2name');
		var targetOc2name = test.getAttribute('oc2cmdname');
		$('#' + test.id + '_inputString').addClass('input-disabled');
		if (test.id == 'hashes') {
			$(test)["0"].parentNode.parentNode.parentNode.children[1].children["0"].children["0"].innerHTML = 'hashes';
			$(test)["0"].parentNode.parentNode.parentNode.children[2].children["0"].value = '';
			$('.newHashTypes').remove();
			$('.hashTypes').addClass('input-disabled');
		}
		if (test.id == 'hash') {
			$(test)["0"].parentNode.parentNode.parentNode.children[1].children["0"].children["0"].innerHTML = 'hash';
			$(test)["0"].parentNode.parentNode.parentNode.children[2].children["0"].value = '';
			$('.newHashTypes').remove();
			$('.hashTypes').addClass('input-disabled');
		}
		$('#' + test.id + '_inputString').attr('readonly', true);
		$('#' + test.id + '_inputString').attr('tabindex', '-1');
		if (test.id == 'actuator_id') {
			delete openc2command.actuator[getCurrentValue]['actuator_id'];
		}
		if (test.id == 'asset_id') {
			delete openc2command.actuator[getCurrentValue]['asset_id'];
		}
		if (targetName == 'target') {
			delete openc2command[targetName][targetOc2name][test.id];
		}
		if(targetName == 'args'){
			delete openc2command[targetName][targetOc2name][test.id];
		}
	}
}

function updateValues(test) {
	checkBrowser();
	var chosenAlgorithm = $(test)[0].text;//所要更新目标的名称，例如某个actuator，或者哈希类型
	var targetName = test.getAttribute('oc2name');//取值为"target"、"actuator"
	var targetOc2name = test.getAttribute('oc2cmdname');//目标说明符名称
	if (targetName == 'target' && test.getAttribute('oc2checkbox') != 'encryption_algorithm' && test.getAttribute('oc2checkbox') != 'hash' && test.getAttribute('oc2checkbox') != 'hashes' && test.getAttribute('oc2checkbox') != 'newhashes') {
		openc2command[targetName][targetOc2name][test.getAttribute('oc2checkbox')] = $(test)[0].innerText;
	}
	if (targetName == 'target' && test.getAttribute('oc2checkbox') == 'encryption_algorithm') {
		openc2command[targetName][targetOc2name][test.getAttribute('oc2checkbox')] = $(test)[0].innerText;
		$('#' + test.getAttribute('oc2checkbox') + '_inputString')[0].innerHTML = $(test)[0].innerText;
	}
	if (targetName == 'target' && (test.getAttribute('oc2checkbox') == 'hashes' || test.getAttribute('oc2checkbox') == 'hashes')) {
		openc2command[targetName][targetOc2name][test.getAttribute('oc2checkbox')] = {};
		openc2command[targetName][targetOc2name][test.getAttribute('oc2checkbox')][chosenAlgorithm] = $('#hashes_inputString')["0"].parentNode.parentNode.nextElementSibling.childNodes["0"].value;
		$('#' + test.getAttribute('oc2checkbox') + '_inputString')[0].innerHTML = $(test)[0].innerText;
	}
	if (targetName == 'target' && test.getAttribute('oc2checkbox') == 'newhashes') {
		openc2command[targetName][targetOc2name]['hashes'][chosenAlgorithm] = '';
		$(test)["0"].parentNode.parentNode.parentNode.parentNode.children[1].childNodes["0"].firstChild.innerHTML = $(test)[0].innerText;
	}
	if (targetName == 'actuator') {
		var getCurrentValue = $('#actuatorButtonId')[0].innerText;
		var oc2checkbox = test.getAttribute('oc2checkbox');
		openc2command['actuator'][getCurrentValue][oc2checkbox] = $(test)[0].value;
	}
}

function asteriskCheck(w) {//返回目标说明符名称
	if (w[1] != '*') {
		return w[1];
	} else {
		return 'any';
	}
}

function createNewHashRow(inObject) {//增加新的哈希输入框

	var asteriskChecker = "newhashes";
	$('#hashContent').after('<tr class="newHashTypes hashContent extraHashContent"><td><td id="' + asteriskChecker + '_hashTD" class="newHashTypes hashContent"><div class="dropdown" id="' + asteriskChecker + "_MenuList" + '"><button class="btn btn-light dropdown-toggle " data-toggle="dropdown" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="hashes"  id="' + asteriskChecker + '_inputString" type="dropdown" tabindex="-1" aria-expanded="false" type="button" >hashes</button></div></div></td></tr>');
	$('#' + asteriskChecker + '_MenuList').append('<div class="dropdown-menu asteriskChecker_Class newHashTypes extraHashContent" id="' + asteriskChecker + '_Menu"></div>');
	$.each(codes['hashes'], function (i, item) {
		$('#' + asteriskChecker + '_Menu').append('<a class="dropdown-item encryptoDropDownMenu extraHashContent newHashTypes" oc2name="target" oc2checkbox="' + asteriskChecker + '" oc2cmdname="' + $('#targetButtonId')[0].innerText + '" role="presentation" href="#" onclick="updateValues(this)">' + item[1] + '</a>');
	});
	$('#' + asteriskChecker + '_hashTD').after('<td class="newHashTypes extraHashContent"><input class="hashTypes inputString' + '" oc2name="target" oc2cmdname=' + $('#targetButtonId')[0].innerText + ' oc2checkbox="' + asteriskChecker + '" onchange="updateInputValues(this)" type="text" minlength="1" tabindex="-1" value=""/><i class="hashTypes fa fa-minus-circle hashContent" onclick="removeInputHash(this)" style="color:rgb(255,0,0);font-size:46;"></i></td>');
}

function updateInputValues(inObject) {
	if ($(inObject)["0"].attributes['oc2checkbox'].value == "hashes" || $(inObject)["0"].attributes['oc2checkbox'].value == "hash" || $(inObject)["0"].attributes['oc2checkbox'].value == "newhashes") {
		openc2command['target']['file']['hashes'][$(inObject)["0"].parentNode.parentNode.children[1].innerText] = $(inObject)["0"].value;
	}
	else if ($(inObject)["0"].attributes['oc2checkbox'].value != "hash" && $(inObject)["0"].attributes['oc2checkbox'].value != "hashes" && $(inObject)["0"].attributes['oc2checkbox'].value != "newhashes") {
		if($(inObject)["0"].attributes['oc2name'].value == "args"&&$(inObject)["0"].attributes['oc2cmdname'].value == "slpf"){
			openc2command["args"]["slpf"][$(inObject)["0"].attributes['oc2checkbox'].value] = $(inObject)[0].value;
		}
		if (valueTypes[$(inObject)["0"].attributes['oc2cmdname'].value] == 'String') {
			openc2command[$(inObject)["0"].attributes['oc2name'].value][$(inObject)["0"].attributes['oc2checkbox'].value] = $(inObject)[0].value;
		} else if (valueTypes[$(inObject)["0"].attributes['oc2cmdname'].value] == 'Map' || valueTypes[$(inObject)["0"].attributes['oc2cmdname'].value] == 'Record' || valueTypes[$(inObject)["0"].attributes['oc2cmdname'].value] == 'Choice') {

			if ($(inObject)["0"].id == 'size_inputString') {
				openc2command[$(inObject)["0"].attributes['oc2name'].value][$(inObject)["0"].attributes['oc2cmdname'].value][$(inObject)["0"].attributes['oc2checkbox'].value] = Number($(inObject)[0].value);
			}
			else {
			openc2command[$(inObject)["0"].attributes['oc2name'].value][$(inObject)["0"].attributes['oc2cmdname'].value][$(inObject)["0"].attributes['oc2checkbox'].value] = $(inObject)[0].value;
			}

		}
	}


}

function removeInputHash(inObject) {//删除哈希输入框中内容
	console.log('update Hashes called ' + $(inObject)["0"].parentNode.parentNode.children[1].innerText + ' = ' + $(inObject)["0"].value);
	delete openc2command['target']['file']['hashes'][$(inObject)["0"].parentNode.parentNode.children[1].innerText];
	$(inObject)["0"].parentNode.parentElement.remove();
}

function argumentChooser() {
	$('.argumentChoice').toggle();
	if ($('.argumentChoice').is(':visible')) {
		openc2command['args'] = {};
	} else {
		$('.slpfChoice').hide();
		document.getElementById("insert_rule").value="";
		document.getElementById("drop_process").value="";
		document.getElementById("running").value="";
		document.getElementById("direction").value="";
		document.getElementById("duration").value="";
		document.getElementById("start_time").value="";
		document.getElementById("stop_time").value="";
		document.getElementById("response_requested").value="";
		delete(openc2command['args']);
	}
}
function slpfChooser() {
	$('.slpfChoice').toggle();
	if ($('.slpfChoice').is(':visible')) {
		openc2command['args']['slpf'] = {};
	} else {
		document.getElementById("insert_rule").value="";
		document.getElementById("drop_process").value="";
		document.getElementById("running").value="";
		document.getElementById("direction").value="";
		delete(openc2command['args']['slpf']);
	}
}
function argumentValueChange(incomingValue, thisid) {
	if (thisid == 'drop_process'||thisid == 'running'||thisid == 'direction'){
		openc2command['args']['slpf'][thisid] = incomingValue;
	}
	if(thisid == 'insert_rule'){
		openc2command['args']['slpf'][thisid] = +incomingValue;
	}
	if (thisid == 'duration') {
		openc2command['args'][thisid] = +incomingValue*86400000;
	}
	if (thisid == 'start_time' || thisid == 'stop_time') {
		openc2command['args'][thisid] = Date.parse(incomingValue);
	}
	if(thisid == 'response_requested'){
		openc2command['args'][thisid] = incomingValue;
	}
}

$('.argumentChoice').hide();
$('.slpfChoice').hide();
