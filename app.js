  var value = "/* Your JavaScript Code Here */"
  var apiUrl = "http://eval-api.jshawl.com/evals"
  var create = document.querySelector(".js-create");
  var Eval = Object.create( new ActiveStorage("Eval") )
  var params = function(){
    var params = window.location.hash.substr(1).split("/")
    params.shift()
    return {
      versionId: params[1],
      evalId: params[0]
    }
  }
  if(params().versionId){
    changeCreateToUpdate()
    $.getJSON(apiUrl +"/"+ params().evalId + "/versions/" + params().versionId)
     .then(function(res){
       cm.setValue(res.contents)
       output.innerHTML = "";
       evaluate(cm.getValue())
     })
  }
  var cm = CodeMirror(document.getElementById("input"),{
    value: value,
    mode: 'javascript',
    lineNumbers: true
  })
  evaluate(cm.getValue());
  function evaluate(input){
    try{
      // use our `log` function, instead of console.log
      var parsedInput = input.replace(/console\.log/g,"log");
      // process the input, outputing the results (console.logs included, via log())
      var code_result = JSON.stringify(eval(parsedInput));

      output.innerHTML += "<br>-> " +code_result;
      output.innerHTML += "<br/>---";
    } catch (e) {
      output.innerHTML += e;
    }

    function log(){
      // output each list of eval'd arguments
      output.innerHTML += "<br> ";
      for(var i = 0; i < arguments.length; i++){
	if(arguments[i].constructor.name == "String"){
	  output.innerText += JSON.stringify(arguments[i])
	} else if(typeof arguments[i] == "function"){
	  output.innerText += arguments[i].toString()
	} else {
	  output.innerText += JSON.stringify(arguments[i])
	}
      }
    }
  }


  var run = document.querySelector(".js-run")
  run.addEventListener("click", function(e){
    e.preventDefault();
    evaluate(cm.getValue())
  })
  var clear = document.querySelector(".js-clear")
  clear.addEventListener("click", function(e){
    e.preventDefault();
    output.innerHTML = "";
  })
  var recent = document.querySelector(".js-recent")
  recent.addEventListener("click", function(e){
    e.preventDefault();
    document.body.classList.toggle("show-recent");
  })
  var isTyping
  document.body.addEventListener("keyup", function(event){
    isTyping = clearTimeout( isTyping )
    isTyping = setTimeout(function(e){
      //save( cm.getValue() )
    },1000)
  })
  create.addEventListener("click", function(event){
    event.preventDefault();
    createEval(cm.getValue());
  })
  function createEval(val){
    $.post(apiUrl, {
      contents: val
    },function(res){
      changeCreateToUpdate()
      window.location.hash = "/" + res.evalId + "/0";
      Eval.create({hash: window.location.hash, time: new Date()})
    })
  }
  $("body").on("click", ".js-update", function(event){
    event.preventDefault();
    update(cm.getValue());
  })
  function create(val){
    $.post(apiUrl, {
      contents: val
    },function(res){
      window.location.hash = "/" + res.evalId + "/0";
    })
  }
  function update(val){
    $.post(apiUrl + "/" + params().evalId + "/versions", {
      contents: val
    },function(res){
      window.location.hash = "/" + res.version.evalId + "/" + (res.index - 1);
      Eval.create({hash: window.location.hash, time: new Date()})
    })
  }
  function changeCreateToUpdate(){
    var $createButton = $('.js-create')
    $createButton.after("<a href='' class='js-update'>Update</a>")
    $createButton.remove();
  }


  var evls = Eval.all();
  // clear old
  evls.forEach(function( e ){
    var d = new Date()
    var oneDayAgo = d.setDate( d.getDate() -  1)
    if(new Date(e.time).getTime() < oneDayAgo){
      e.destroy() 
    }
  })

  // show recent
  var $container = $(".js-recent ul")
  for(var i = 0; i < evls.length; i++){
    var hash = evls[i].hash
    var $a = $("<a href='"+hash+"'>"+hash+"</a>");
    var $s = $("<small> "+$.timeago(evls[i].time)+"</small>");
    var $li = $("<li></li>");
    $li.append($a);
    $li.append($s);
    $container.append($li)
  }
