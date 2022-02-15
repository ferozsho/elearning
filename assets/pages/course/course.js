var btn = document.querySelector('.add');
var remove = document.querySelector('.draggable');
function dragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
};
 
function dragEnter(e) {
  this.classList.add('over');
}
 
function dragLeave(e) {
  e.stopPropagation();
  this.classList.remove('over');
}
 
function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}
 
function dragDrop(e) {
  if (dragSrcEl != this) {
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');
  }
  return false;
}
 
function dragEnd(e) {
  var listItens = document.querySelectorAll('.draggable');
  [].forEach.call(listItens, function(item) {
    item.classList.remove('over');
  });
  this.style.opacity = '1';
}
 
function addEventsDragAndDrop(el) {
  el.addEventListener('dragstart', dragStart, false);
  el.addEventListener('dragenter', dragEnter, false);
  el.addEventListener('dragover', dragOver, false);
  el.addEventListener('dragleave', dragLeave, false);
  el.addEventListener('drop', dragDrop, false);
  el.addEventListener('dragend', dragEnd, false);
}

var listItens = document.querySelectorAll('.draggable');
[].forEach.call(listItens, function(item) {
  addEventsDragAndDrop(item);
});
function toinput(e){
    if(e.innerHTML.includes(". Chapter") || e.innerHTML.includes(". Lesson") || e.innerHTML.includes(". Topic") || e.innerHTML.includes(". Sub Topic") || e.innerHTML.includes("Level ") ){
      e.previousSibling.value = ''; 
    }
    if(e.innerHTML == "Add Module Name"){
      e.previousSibling.value = ''; 
    }
    e.setAttribute("style","display:none");
    e.previousSibling.setAttribute("style","display:block");
    e.previousSibling.focus();
}
function get_module_details(cid, module_id, mytagArray){
  $.ajax({
    url: API_CONTENT_URL + '/course_tags/?course_id='+cid+'&module_id='+module_id,
    type: 'get',
    dataType: 'json',
    success:function(response){
      var tags_response = "0";
      mytagArray.forEach(function (element, index) {
        var tag_data = {
            "tag_name": element,
            "module_id": module_id_val,
            "course_id": cid
        }
        $.ajax({
          url: API_CONTENT_URL + '/course_tags/?course_id='+cid+'&module_id='+module_id_val,
          type: 'POST',
          data: JSON.stringify(tag_data),
          contentType: "application/json; charset=utf-8",
          success:function(response){
            tags_response = "0";
          },
          error: function(error) {
            tags_response = "1";
            toastr.error("Response Error: " + error.message);
            console.log(error);
          }
        });
      });
      if(tags_response == "0"){
          toastr.success("Tags Added Successfully");
      }
    }
  });
}
function totext(e){
    if(e.value == ''){
        e.value = e.nextSibling.dataset.prev_val;
    }
    if(e.value != "" && e.value != "Add Module Name"){
      var class_module_level = e.parentElement.parentElement.parentElement.classList[1];
      var first_five_char_class = class_module_level.substring(0,5);
      var get_submodule_level_values = '';
      if(e.dataset.module_id !== undefined){
        var url = API_CONTENT_URL + '/course_module/'+e.dataset.module_id+'/';
        var method = "PUT";
      }else{
        var url = API_CONTENT_URL + '/course_module/';
        var method = "POST";
      }
      if(first_five_char_class === "modul"){
        var level_number = class_module_level.split('_')[1];
        var get_submodule_level_values = {
          module_name: String(e.value),
          level: parseInt(level_number), 
          course_id:String(document.getElementById("course_id").value),
          parent_id:null
        }
      }else if(first_five_char_class === "sub_m"){
        var class_module_main_level = e.parentElement.parentElement.parentElement.classList[3];
        var class_module_sub_level = e.parentElement.parentElement.parentElement.classList[2];
        var parent_id = e.parentElement.parentElement.parentElement.parentElement.childNodes[2].firstChild.getAttribute("data-module_id");
        get_submodule_level_values = get_submodule_level_val(class_module_main_level, class_module_sub_level, e.value, parent_id);
      }

      let cid = e.dataset.cid;
      let module_id_val = e.dataset.module_id;
      const mytagArray = e.value.split(" ");
      console.log(mytagArray);
      var prev_tags = get_module_details(cid, module_id_val, mytagArray);
      
      e.nextSibling.dataset.prev_val = e.value;
      if(get_submodule_level_values != ''){
        var message = "";
        post_json_dat(url, get_submodule_level_values, method, e, message);
      }
    }
    e.nextSibling.innerHTML = e.value; 
    e.setAttribute("style","display:none");
    e.nextSibling.setAttribute("style","display:block");
    e.nextSibling.focus();
}

function get_submodule_level_val(class_module_main_level, class_module_sub_level, ele_val, parent_id_val){
  var data_course_module = "";
  if(class_module_sub_level.indexOf('.') !== -1){
      var level_number = (class_module_sub_level.split("_module")[0]).split(".")[class_module_sub_level.split(".").length-1];
      data_course_module = {
        module_name: String(ele_val),
        level: parseInt(level_number), 
        course_id:String(document.getElementById("course_id").value),
        parent_id: parent_id_val
      }

  }else{
      var level_number = class_module_sub_level.split('_')[1];
      data_course_module = {
        module_name: String(ele_val),
        level: parseInt(level_number), 
        course_id:String(document.getElementById("course_id").value),
        parent_id: parent_id_val
      }
  }
  return data_course_module;
}

function post_json_dat(url, data, call_method, e, message){
  fetch(url, {
    method: call_method,
    body: JSON.stringify(data),
    headers: {"Content-type": "application/json; charset=UTF-8", "Authorization": "Bearer " + getUserInfo().access_token},
  })
  .then((response) => response.json())
  .then((json) => {
    var module_name = "";
    el_1 = e.parentElement.nextSibling.childNodes[1].childNodes[0].firstChild;//edit
    el_2 = e.parentElement.nextSibling.childNodes[1].childNodes[1].firstChild;//delete
    el_3 = e.parentElement.parentElement.childNodes[9].firstChild;//tags
    el_4 = e.parentElement.parentElement.childNodes[4].firstChild;//progress
    el_5 = e.parentElement.parentElement.childNodes[5].firstChild;//attachment
    el_6 = e.parentElement.parentElement.childNodes[6].firstChild;//comment
    el_7 = e.parentElement.parentElement.childNodes[7].firstChild;//assign

    el_li_0 = e.parentElement.parentElement.childNodes[0];
    el_li_1 = e.parentElement.parentElement.childNodes[1];
    el_li_2 = e.parentElement.parentElement.childNodes[2];
    el_li_3 = e.parentElement.parentElement.childNodes[3];
    el_li_4 = e.parentElement.parentElement.childNodes[4];
    el_li_5 = e.parentElement.parentElement.childNodes[5];
    el_li_6 = e.parentElement.parentElement.childNodes[6];
    el_li_7 = e.parentElement.parentElement.childNodes[7];
    el_li_8 = e.parentElement.parentElement.childNodes[8];
    el_li_8 = e.parentElement.parentElement.childNodes[9];
    el_1.setAttribute("data-flinkto", "courseslistlevel");
    if(json.module_id != undefined || json.module_id != null){
      e.setAttribute("data-module_id", json.module_id);
      el_1.setAttribute("data-module_id", json.module_id);
      el_2.setAttribute("data-module_id", json.module_id);
      el_3.setAttribute("data-module_id", json.module_id);
      el_4.setAttribute("data-module_id", json.module_id);
      el_5.setAttribute("data-module_id", json.module_id);
      el_6.setAttribute("data-module_id", json.module_id);
      el_7.setAttribute("data-module_id", json.module_id);
    }
    if(json.course_id != undefined || json.course_id != null){
      e.setAttribute("data-cid", json.course_id);
      el_1.setAttribute("data-cid", json.course_id);
      el_2.setAttribute("data-cid", json.course_id);
      el_3.setAttribute("data-cid", json.course_id);
      el_4.setAttribute("data-cid", json.course_id);
      el_5.setAttribute("data-cid", json.course_id);
      el_6.setAttribute("data-cid", json.course_id);
      el_7.setAttribute("data-cid", json.course_id);
    }
    if(json.can_access == false){
      el_li_0.style.cssText = "pointer-events: none";
      el_li_1.style.cssText = "pointer-events: none";
      el_li_2.style.cssText = "pointer-events: none";
      el_li_3.style.cssText = "pointer-events: none";
      el_li_4.style.cssText = "pointer-events: none";
      el_li_5.style.cssText = "pointer-events: none";
      el_li_6.style.cssText = "pointer-events: none";
      el_li_7.style.cssText = "pointer-events: none";
      el_li_8.style.cssText = "pointer-events: none";
      el_li_9.style.cssText = "pointer-events: none";
    }
    if(json.module_name != undefined || json.module_name != null){
      el_2.setAttribute("data-name", json.module_name);
      module_name = json.module_name;
    }
    var classList = e.parentElement.parentElement.parentElement.className.split(/\s+/);
    var num = "";
    if(classList[2] == 'main_mod'){
      num = 0;
    }else{
      var index = classList[1].lastIndexOf("_");
      var res_1 = Number(classList[1].substr(index+1));
      var result = classList[1].substr(index+1)+"."+ Number(e.parentElement.parentElement.childNodes.length - 8);
      num = String(result).match(/\./g).length;
    }
    if(num === 0){
      var result_textMsg = "Module:";
    }else if(num === 1){
      var result_textMsg = "Chapter:";
    }else if(num === 2){
      var result_textMsg = "Lesson:";
    }else if(num === 3){
      var result_textMsg = "Topic:";
    }else if (num === 4){
      var result_textMsg = "Sub Topic:";
    }else if (num > 4){
      var result_textMsg = "Level:";
    }
    toastr.success(result_textMsg+" "+module_name+" Created.");
  })
  .catch(function (error) {
    console.log("Requestfailed", error);
  });
}
function check_value(e){
    var x = e.parentElement.parentElement.parentElement.lastElementChild.childNodes;
    if(e.value != ''){
        e.parentElement.parentElement.setAttribute("style","opacity:1");
        var classList = e.parentElement.parentElement.parentElement.className.split(/\s+/);
        var index = classList[1].lastIndexOf("_");
        if(classList[2] == 'main_mod_empty'){
            e.parentElement.parentElement.parentElement.classList.remove('main_mod_empty');
            e.parentElement.parentElement.parentElement.classList.add('main_mod');
            e.parentElement.parentElement.parentElement.classList.add('draggable');
            e.parentElement.parentElement.parentElement.setAttribute("style","opacity:1");
            if(e.parentElement.previousSibling.nodeName == "#text"){
                e.parentElement.parentElement.childNodes[1].firstChild.setAttribute('draggable','true');
            }else{
                e.parentElement.previousSibling.firstChild.setAttribute("draggable","true");
            }
        }
        var result = Number(classList[1].substr(index+1)) + Number(1);
    }else{
        e.parentElement.parentElement.parentElement.classList.remove('main_mod');
        e.parentElement.parentElement.parentElement.classList.add('main_mod_empty');
        e.parentElement.parentElement.parentElement.classList.remove('draggable');
        e.parentElement.parentElement.setAttribute("style","opacity:0.5");
        if(e.parentElement.previousSibling.firstChild !== null){
          e.parentElement.previousSibling.firstChild.setAttribute("draggable","true");
        }
    }
    var listItens = document.querySelectorAll('.draggable');
    [].forEach.call(listItens, function(item) {
      addEventsDragAndDrop(item);
    });

}
function add_sub(e){
    var x =e.parentElement.parentElement.childNodes;
    if(x[0].nodeName == "#text"){
        var inp_val = x[5].childNodes[1].innerHTML;
    }else{
        var inp_val = x[2].childNodes[1].innerHTML;
    }
    if(inp_val != ''){
        var classList = e.parentElement.parentElement.parentElement.className.split(/\s+/);
        if(classList[2] == 'main_mod'){
            if(e.parentElement.parentElement.parentElement.parentElement.childNodes[e.parentElement.parentElement.parentElement.parentElement.childNodes.length-1].classList !== undefined && e.parentElement.parentElement.parentElement.parentElement.childNodes[e.parentElement.parentElement.parentElement.parentElement.childNodes.length-1].classList[2] == 'main_mod_empty'){
              var main_mod_level = e.parentElement.parentElement.parentElement.classList[1];
                var index = classList[1].lastIndexOf("_");
                var result = Number(classList[1].substr(index+1));
                if(e.parentElement.parentElement.childNodes[0].nodeName == '#text'){
                    var result = Number(e.parentElement.parentElement.childNodes.length)- Number(20);
                }else{
                    var result = Number(e.parentElement.parentElement.childNodes.length)- Number(9);
                }
                newHTML = "<div class='module sub_module_"+result+" sub_"+result+" "+main_mod_level+"' style='width:95%;margin-right: -2px;'>";
                newHTML += "<ul class='sub_module'>";
                newHTML += "<li class='course_img_icon disp_in_block flt_left'><img src='../assets/images/course-icon.png' class='course_icon'></li>";
                newHTML += "<li class='expand_img_icon disp_in_block flt_left'><img src='../assets/images/arrow_up_icon.png' class='expand_icon' onclick='toggle_collapse_expand(this);'></li>";
                newHTML += "<li class='module_input disp_in_block flt_left'><input type='text' class='input_module_fld' id='module_inp' placeholder='Add Module Name' onChange='check_value(this);' value='Level "+result+"'onblur='totext(this);' style='display: none;' maxlength='256'><p onclick='toinput(this);' id='sub_"+result+"_"+main_mod_level+"' data-prev_val='"+result+". Chapter'>"+result+". Chapter</p></li>";
                newHTML += "<li class='dots_img_icon disp_in_block flt_right'><button class='btn dropdown-toggle dbtn' type='button' id='dropdownMenuButton3' data-bs-toggle='dropdown' aria-expanded='false'><i class='fas fa-ellipsis-v'></i></button><ul class='dropdown-menu' aria-labelledby='dropdownMenuButton3'><li><a class='dropdown-item green'>Edit</a></li><li><a data-bs-toggle='modal' data-bs-target='#mAlert' class='dropdown-item red' onClick='delete_module_confirm(this)'>Delete</a></li></ul></li>";
                newHTML += "<li class='progress_btn disp_in_block flt_right'><p class='status_new'>New</p></li>";
                newHTML += "<li class='attach_img_icon disp_in_block flt_right'><img src='../assets/images/attach-icon.png' class='attach_icon'></li>";
                newHTML += "<li class='message_img_icon disp_in_block flt_right'><img src='../assets/images/message-icon.png' class='message_icon'></li>";
                newHTML += "<li class='user_img_icon disp_in_block flt_right'><img src='../assets/images/user-icon.png' class='user_icon'></li>";
                newHTML += "<li class='plus_img_icon disp_in_block flt_right'><img src='../assets/images/plus-icon.png' class='plus_icon' onClick='add_sub_sub(this);'></li>";
                newHTML += "<li class='frame_img_icon disp_in_block flt_right'><img src='../assets/images/frame-icon.png' class='frame_icon' onclick='show_tag_popup(this)' data-getresult='tag'></li>";
                newHTML += "</ul>";
                newHTML += "</div>";
                e.parentElement.parentElement.insertAdjacentHTML('beforeend', newHTML);

                var class_module_main_level = main_mod_level;
                var class_module_sub_level = "sub_"+result;
                var input_val = "Level "+result;
                toastr.success("Chapter Added.");
                return;
            }
            if((e.parentElement.parentElement.parentElement.childNodes[0].nodeName == '#text' && e.parentElement.parentElement.parentElement.childNodes.length == 3) ||  (e.parentElement.parentElement.parentElement.childNodes[0].nodeName != '#text' && e.parentElement.parentElement.parentElement.childNodes.length == 1)){
                var index = classList[1].lastIndexOf("_");
                var result = Number(classList[1].substr(index+1));
                var result = Number(e.parentElement.parentElement.parentElement.parentElement.childNodes.length) + Number(1);
                newHTML = "<div class='module module_"+result+" main_mod_empty' style='opacity:0.5;'>";
                newHTML += "<ul class='main_module module_opacity'>";
                newHTML += "<li class='course_img_icon disp_in_block flt_left'><img src='../assets/images/course-icon.png' class='course_icon'></li>";
                newHTML += "<li class='expand_img_icon disp_in_block flt_left'><img src='../assets/images/arrow_up_icon.png' class='expand_icon' onclick='toggle_collapse_expand(this);'></li>";
                newHTML += "<li class='module_input disp_in_block flt_left'><input type='text' class='input_module_fld' id='module_inp' placeholder='Add Module Name' onChange='check_value(this);' value=''onblur='totext(this);' style='display: none;' maxlength='256'><p onclick='toinput(this);' id='module_module_"+result+"' data-prev_val='Add Module Name'>Add Module Name</p></li>";
                newHTML += "<li class='dots_img_icon disp_in_block flt_right'><button class='btn dropdown-toggle dbtn' type='button' id='dropdownMenuButton3' data-bs-toggle='dropdown' aria-expanded='false'><i class='fas fa-ellipsis-v'></i></button><ul class='dropdown-menu' aria-labelledby='dropdownMenuButton3'><li><a class='dropdown-item green'>Edit</a></li><li><a data-bs-toggle='modal' data-bs-target='#mAlert' data-name='' data-cid=''  data-module_id='' class='dropdown-item red' onClick='delete_module_confirm(this)'>Delete</a></li></ul></li>";
                newHTML += "<li class='progress_btn disp_in_block flt_right'><p class='status_new'>New</p></li>";
                newHTML += "<li class='attach_img_icon disp_in_block flt_right'><img src='../assets/images/attach-icon.png' class='attach_icon'></li>";
                newHTML += "<li class='message_img_icon disp_in_block flt_right'><img src='../assets/images/message-icon.png' class='message_icon'></li>";
                newHTML += "<li class='user_img_icon disp_in_block flt_right'><img src='../assets/images/user-icon.png' class='user_icon'></li></li>";
                newHTML += "<li class='plus_img_icon disp_in_block flt_right'><img src='../assets/images/plus-icon.png' class='plus_icon' onClick='add_sub(this);'></li>";
                newHTML += "<li class='frame_img_icon disp_in_block flt_right'><img src='../assets/images/frame-icon.png' class='frame_icon' onclick='show_tag_popup(this)' data-getresult='tag'></li>";
                newHTML += "</ul>";
                newHTML += "</div>";
                e.parentElement.parentElement.parentElement.parentElement.insertAdjacentHTML('beforeend', newHTML);
            }
        }
    }
}

function add_sub_sub(e){
  var x =e.parentElement.parentElement.childNodes;
  if(x.length == 17){
    var inp_val = x[5].childNodes[0].value;
  }
  if(x.length == 10){
    var inp_val = x[2].childNodes[0].value;
  }
  if(inp_val != ''){
    var main_mod_level = e.parentElement.parentElement.parentElement.classList[3];
    var classList = e.parentElement.parentElement.parentElement.className.split(/\s+/);
    var index = classList[1].lastIndexOf("_");
    var res_1 = Number(classList[1].substr(index+1));
    var result = classList[1].substr(index+1)+"."+ Number(e.parentElement.parentElement.childNodes.length - 9);
    var num = String(result).match(/\./g).length;
    if(num === 1){
      var result_text = Number(e.parentElement.parentElement.childNodes.length - 9)+". Lesson";
      var result_textMsg = "Lesson";
    }else if(num === 2){
      var result_text = Number(e.parentElement.parentElement.childNodes.length - 9)+". Topic";
      var result_textMsg = "Topic";
    }else if(num === 3){
      var result_text = Number(e.parentElement.parentElement.childNodes.length - 9)+". Sub Topic";
      var result_textMsg = "Sub Topic";
    }else{
      var result_text = "Level "+result;
      var result_textMsg = "Level";
    }
    newHTML = "<div class='module sub_module_"+result+" sub_"+result+" "+main_mod_level+"' style='width:95%;margin-right: -2px;'>";
    newHTML += "<ul class='sub_module'>";
    newHTML += "<li class='course_img_icon disp_in_block flt_left'><img src='../assets/images/course-icon.png' class='course_icon'></li>";
    newHTML += "<li class='expand_img_icon disp_in_block flt_left'><img src='../assets/images/arrow_up_icon.png' class='expand_icon' onclick='toggle_collapse_expand(this);'></li>";
    newHTML += "<li class='module_input disp_in_block flt_left'><input type='text' class='input_module_fld' id='module_inp' placeholder='Add Module Name' onChange='check_value(this);' value='Level "+result+"'onblur='totext(this);' style='display: none;' maxlength='256'><p onclick='toinput(this);' id='sub_"+result+"_"+main_mod_level+"' data-prev_val='"+result_text+"'>"+result_text+"</p></li>";
    newHTML += "<li class='dots_img_icon disp_in_block flt_right'><button class='btn dropdown-toggle dbtn' type='button' id='dropdownMenuButton3' data-bs-toggle='dropdown' aria-expanded='false'><i class='fas fa-ellipsis-v'></i></button><ul class='dropdown-menu' aria-labelledby='dropdownMenuButton3'><li><a class='dropdown-item green'>Edit</a></li><li><a data-bs-toggle='modal' data-bs-target='#mAlert' class='dropdown-item red' onClick='delete_module_confirm(this)'>Delete</a></li></ul></li>";
    newHTML += "<li class='progress_btn disp_in_block flt_right'><p class='status_new'>New</p></li>";
    newHTML += "<li class='attach_img_icon disp_in_block flt_right'><img src='../assets/images/attach-icon.png' class='attach_icon'></li>";
    newHTML += "<li class='message_img_icon disp_in_block flt_right'><img src='../assets/images/message-icon.png' class='message_icon'></li>";
    newHTML += "<li class='user_img_icon disp_in_block flt_right'><img src='../assets/images/user-icon.png' class='user_icon'></li>";
    newHTML += "<li class='plus_img_icon disp_in_block flt_right'><img src='../assets/images/plus-icon.png' class='plus_icon' onClick='add_sub_sub(this);'></li>";
    newHTML += "<li class='frame_img_icon disp_in_block flt_right'><img src='../assets/images/frame-icon.png' class='frame_icon' onclick='show_tag_popup(this)' data-getresult='tag'></li>";
    newHTML += "</ul>";
    newHTML += "</div>";
    e.parentElement.parentElement.insertAdjacentHTML('beforeend', newHTML);
    var class_module_main_level = main_mod_level;
    var class_module_sub_level = "sub_"+result;
    var input_val = "Level "+result;
    toastr.success(result_textMsg+" Added.");
   }
}

/******* Expand and collapse main and sub module Levels Starts **************/
function toggle_collapse_expand(e){
    var childrendivs = [],
    children = e.parentElement.parentElement.children;
    var action = e.innerHTML;
    for(var i = 0; i < children.length; i++){
        if (children[i].tagName == "DIV") {
          if(children[i].classList.contains('disp_none')){
              e.src="../assets/images/arrow_up_icon.png";
              children[i].classList.add('disp_block');
              children[i].classList.remove('disp_none');
              childrendivs.push(children[i]);
          }else{
              e.src="../assets/images/arrow_down_icon.png";
              children[i].classList.add('disp_none');
              children[i].classList.remove('disp_block');
              childrendivs.push(children[i]);
          }
        }
    }
}
function show_tag_popup(e){
  //var offsets = e.getBoundingClientRect();
  //var offset_box = document.getElementById("course_box").getBoundingClientRect();
  //var top = offsets.top + Math.max( $("html").scrollTop(), $("body").scrollTop() ) - 70;
  //var right = offset_box.left;
  const container = document.getElementById("popup_course_icon");
  const modal = new bootstrap.Modal(container, { backdrop: true, keyboard: true });
  //document.getElementById("content-courseModule").style.transform = "translate(0px, "+top+"px)";
  var url = `${SITE_URL_PROTOCOL}/assets/pages/courses/course_tag.html?t=` + Math.floor(Date.now() / 1000);
  $('.modal-content').load(url,function(result){
    document.getElementById("course_param").setAttribute("data-module_id", e.dataset.module_id);
    document.getElementById("course_param").setAttribute("data-cid", e.dataset.cid);
    modal.toggle();
  });
}

function show_attachment_popup(e){
  //var right = offset_box.left;
  const container = document.getElementById("popup_course_icon");
  const modal = new bootstrap.Modal(container, { backdrop: true, keyboard: true });
  var url = `${SITE_URL_PROTOCOL}/assets/pages/courses/attachment_popup.html?t=` + Math.floor(Date.now() / 1000);
  $('.modal-content').load(url,function(result){
    document.getElementById("course_param").setAttribute("data-module_id", e.dataset.module_id);
    document.getElementById("course_param").setAttribute("data-cid", e.dataset.cid);
    modal.toggle();
  });
}
function show_message_popup(e){
  //var right = offset_box.left;
  const container = document.getElementById("popup_course_icon");
  const modal = new bootstrap.Modal(container, { backdrop: true, keyboard: true });
  var url = `${SITE_URL_PROTOCOL}/assets/pages/courses/message_popup.html?t=` + Math.floor(Date.now() / 1000);
  $('.modal-content').load(url,function(result){
    document.getElementById("course_param").setAttribute("data-module_id", e.dataset.module_id);
    document.getElementById("course_param").setAttribute("data-cid", e.dataset.cid);
    modal.toggle();
  });
}
function show_assignee_popup(e){
  //var right = offset_box.left;
  const container = document.getElementById("popup_course_icon");
  const modal = new bootstrap.Modal(container, { backdrop: true, keyboard: true });
  var url = `${SITE_URL_PROTOCOL}/assets/pages/courses/assignee_popup.html?t=` + Math.floor(Date.now() / 1000);
  $('.modal-content').load(url,function(result){
    document.getElementById("course_param").setAttribute("data-module_id", e.dataset.module_id);
    document.getElementById("course_param").setAttribute("data-cid", e.dataset.cid);
    modal.toggle();
  });
}
$(document).ready(function(){
  $('#popup_course_icon').on('hidden.bs.modal', function () {
      $('#course_id').trigger('click');
  });
});
function moduleMobilePreview(cid){

  $("#mobile_preview").addClass("overlay_target");
  var course_id = $("#dp_course_id").val();
  console.log(course_id);
    var url = API_CONTENT_URL + `/course_module_detail/?course_id=`+cid;
    fetch(url, {
      method: "GET",
      headers: {"Content-type": "application/json; charset=UTF-8", "Authorization": "Bearer " + getUserInfo().access_token}
    })
    .then((response) => response.json())
    .then((data) => {
      var course_data_html = `<div class="course_data">
                                <div class="row">
                                  <div class="col-12 title-head">
                                  <h4 class="p-3" style="margin-bottom: -20px;">${data.course_name}</h4>
                                  </div>
                                  <div class="col-12 title-head">
                                  <p class="p-3" style="margin-bottom: 0rem !important;">${data.description}</p>
                                  </div>
                                </div>
                                <div class="row">
                                </div>
                              </div>`;
      var newDIVs = $("<div class='course' id='course_box' style='background-color: rgb(231 231 231);'></div>");
      get_list_preview( data.module_detail, newDIVs, 1, "mobile");
      var outerHtml = newDIVs.prop('outerHTML');
      document.getElementById("mp_courseData").innerHTML = course_data_html+outerHtml;
    });
}
function moduleDesktopPreview(cid){
  $("#desktop_preview").addClass("overlay_target");
  var course_id = $("#dp_course_id").val();
  console.log(course_id);
    var url = API_CONTENT_URL + `/course_module_detail/?course_id=`+cid;
    fetch(url, {
      method: "GET",
      headers: {"Content-type": "application/json; charset=UTF-8", "Authorization": "Bearer " + getUserInfo().access_token}
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      var course_data_html = `<div class="course_data">
                                <div class="row">
                                  <div class="col-12 title-head">
                                  <h4 class="p-3" style="margin-bottom: -20px;">${data.course_name}</h4>
                                  </div>
                                  <div class="col-12 title-head">
                                  <p class="p-3" style="margin-bottom: 0rem !important;">${data.description}</p>
                                  </div>
                                </div>
                                <div class="row">
                                </div>
                              </div>`;
      var newDIVs = $("<div class='course' id='course_box' style='background-color: rgb(231 231 231);'></div>");
      get_list_preview( data.module_detail, newDIVs, 1, "desktop");
      var outerHtml = newDIVs.prop('outerHTML');
      document.getElementById("dp_courseData").innerHTML = course_data_html+outerHtml;
    });
}
/***************Course Modules Get Json and assign Tree structured format and Design Starts Here*************/
function get_list_preview( a, $parent , level_count_inc, prev_type) {
  var mod_width = "width:93%;";
  if(prev_type == "mobile"){
    mod_width = "width:87%;";
  }
  var levels = '';
  var newDIV = $("<div></div>");
  for (var i = 0; i < a.length; i++) {
      if (a[i]) {
        var num = "";
          var level_count = a[i].module_name.split("/").length - 1;
          if(a[i].parent_id == null){
            var n = a[i].module_name.lastIndexOf('/');
            var input_value = a[i].module_name.substring(n + 1);
            var color = "color:#F36A10;";
            newDIV = $("<div class='module module_"+level_count_inc+" main_mod draggable' id='"+a[i].level+"' draggable='true' style='opacity:1;border-left-style: dashed;border-left-color: #d9d7d7;'></div>");
            newUl = $("<ul class='main_module module_opacity' style='opacity:1;padding-bottom: 0px;border-style: none;'></ul>");
            newUl.append("<li style='background-color: white;'><p class='mb-0' style='padding:15px;"+color+"'><b>"+input_value+" :</b></p></li>");
            var module_data_html  = get_module_details_preview(a[i]);
            newUl.append(module_data_html);
          }else{
            var class_name = $parent.parent().prop('className').split(" ");
            var first_five_char_class = class_name[1].substring(0,5);
            if(first_five_char_class === "modul"){
              var levels = a[i].level;
              var color = "color:red;";
            }else{
              var levels = $parent.parent().attr('id')+"."+a[i].level;
              num = String(levels).match(/\./g).length;
              if(num == ""){
                var color = "color:#20204F;";
              }else if(num === 1){
                var color = "color:#448744;";
              }else if(num === 2){
                var color = "color:#7e2ebb;";
              }else if(num === 3){
                var color = "color:#8080bd;";
              }else if (num === 4){
                var color = "color:#8b364d;";
              }else if (num > 4){
                var color = "color:#998129;";
              }
            }
            var n = a[i].module_name.lastIndexOf('/');
            var input_value = a[i].module_name.substring(n + 1);
            console.log(num+"= "+input_value)
            newDIV = $("<div class='module sub_module_"+levels+" sub_"+levels+" module_"+(level_count_inc - 1)+" disp_block' id='"+levels+"' style='"+mod_width+"border-left-style: dashed;border-left-color: #d9d7d7;'>");
            newUl = $("<ul class='sub_module' style='padding-bottom: 0px;border-style: none;'></ul>");
            const [module_content, module_attachments] = get_module_details_preview(a[i]);
            newUl.append("<li style='background-color: white;'><p class='mb-0' style='padding:15px;"+color+"'><b>"+input_value+" :</b></p>"+module_content+"</li>");
            newUl.append(module_attachments);
          }
          if(level_count === 0){  
            newDIV.append(newUl);
            $parent.append(newDIV);

            level_count_inc++;
          }else{
            newDIV.append(newUl);
            $parent.append(newDIV);
          }
          if (a[i].children){
              get_list_preview( a[i].children, newUl, level_count_inc, prev_type);
          }
      }
    $parent.append(newDIV);
  }
}
/***************Course Modules Get Json and assign Tree structured format and Design Ends Here*************/

function get_module_details_preview(module_data){
        var module_content = module_data.content;
        var module_attachments = module_data.attachments;
        var module_content_html = "";
        var module_attachments_html = "";
        if(module_content){
            module_content_html +=`<li class="has-children is-open"><ul class="acnav__list acnav__list--level2 wbg br-10" style="border-left: none;padding-left: 0px;"><li class="has-children">
                                <div class="acnav__label acnav__label--level2" style="border:none;">
                                  <div class="accordionlist">
                                    <div class="row">
                                      <div class="col-md-12 acc-text">

                                        ${module_content.content}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li></ul>`;
        }
        if(module_attachments.length > 0){
            module_attachments.forEach(function (element, index) {
                var file_type = element.attachment_type.split('/')[0];
                if(file_type === 'image' || file_type === 'video' || file_type === 'audio' || file_type === 'application'){
                    module_attachments_html += `<li class="has-children is-open" style="margin-top: 10px;">
                                    <ul class="acnav__list acnav__list--level2 wbg br-10" style="border-left: none;">
                                      <li class="has-children">
                                        <div class="acnav__label acnav__label--level2" style="border:none;">
                                          <div class="accordionlist">
                                            <div class="row">
                                              <div class="col-md-12 acc-text">`;
                    if(element.attachment_type.split('/')[0] === 'image'){
                          module_attachments_html +=`<img class="w-100"src="${API_CONTENT_URL}${element.attachment}" alt="${element.attachment_name}">`;
                    }else if(element.attachment_type.split('/')[0] === 'video'){
                        module_attachments_html +=`<video id='video' controls preload='none' width="600" poster=""><source id='mp4' src="${API_CONTENT_URL}${element.attachment}" type='video/mp4' /><p>Your user agent does not support the HTML5 Video element.</p></video>`;
                    }else if(element.attachment_type.split('/')[0] === 'audio'){
                        module_attachments_html +=`<audio controls><source src="${API_CONTENT_URL}${element.attachment}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
                    }else if(element.attachment_type.split('/')[0] === 'application'){
                      var mathcount = Math.floor(Math.random() * 1000);
                       module_attachments_html +=`<iframe id="${element.id}" src='https://docs.google.com/gview?url=${API_CONTENT_URL}${element.attachment}&embedded=true&ignore=${mathcount}' width='100%' height='500px' frameborder='1'></iframe><p>If this browser does not support file. Please download the File to view it: <a href="${API_CONTENT_URL}${element.attachment}" target="_blank">Download File</a>.</p>`;
                    }
                    module_attachments_html +=`</div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    </ul>
                                  </li>`;
                }
          });
        }
        return [module_content_html, module_attachments_html];

}
$(document).ready(function(){
  $("#desktop-preview-close").on("click", function() {
    $("#desktop_preview").removeClass("overlay_target");
  });
  $("#mobile-preview-close").on("click", function() {
    $("#mobile_preview").removeClass("overlay_target");
  });
});

function delete_module_confirm(e){
  var element = e;
  $("#mAlertName").text(e.dataset.name);
  var module_name = e.dataset.name;
  var classList = e.parentElement.parentElement.parentElement.parentElement.parentElement.className.split(/\s+/);
  var num = "";
  if(classList[2] == 'main_mod'){
    num = 0;
  }else{
    var index = classList[1].lastIndexOf("_");
    var res_1 = Number(classList[1].substr(index+1));
    var result = classList[1].substr(index+1)+"."+ Number(e.parentElement.parentElement.parentElement.parentElement.childNodes.length - 8);
    num = String(result).match(/\./g).length;
  }
  if(num === 0){
    var result_textMsg = "Module:";
  }else if(num === 1){
    var result_textMsg = "Chapter:";
  }else if(num === 2){
    var result_textMsg = "Lesson:";
  }else if(num === 3){
    var result_textMsg = "Topic:";
  }else if (num === 4){
    var result_textMsg = "Sub Topic:";
  }else if (num > 4){
    var result_textMsg = "Level:";
  }
  var toastr_message = result_textMsg+" "+module_name+" Deleted successfully.";
  var module_id = e.dataset.module_id;
  var module_name = e.dataset.name;
  loadAlertModal(toastr_message, module_id, module_name);
}
  function loadAlertModal(toastr_message, module_id, module_name){
    $('#mAlert').on('shown.bs.modal', function (event) {
      $("#mAlertCancel").focus();
      $(document).on('click', '#mAlertDelete', function(e) {
        var url_api = API_CONTENT_URL + '/course_module/'+module_id+'/';
        var method = "DELETE";
        $.ajax({
          url: url_api,
          type: method,
          dataType: 'json',
          headers: {
            "Authorization": "Bearer " + getUserInfo().access_token,
            "Content-Type": "application/json"
          },
          success:function(response){
            $("#mAlertCancel").click();
            $("#course_id").trigger("click");
            toastr.success(toastr_message);
          },
          error: function(error){
            toastr.error("Response Error: " + error.message);
            console.log(error);
          }
        });
      });
      //mAlertCancel
      $(document).on('click', '#mAlertCancel', function() {
        $(document).off('click', '#mAlertCancel');
        $(document).off('click', '#mAlertDelete');
      });
      
    });
    
    //hidden.bs.modal 
    $('#mAlert').on('hidden.bs.modal', function (event) {
      $(document).off('click', '#mAlertCancel');
      $(document).off('click', '#mAlertDelete');
      var modal = $(this);
      modal.find('.modal-content input').val(null);
      modal.find('.modal-content #mAlertName').html("Loading...");
    });
}