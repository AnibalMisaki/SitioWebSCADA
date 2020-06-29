window.settings = {
    "Host":"127.0.0.1",
    "Port":"8080"
}
ObtenerConfiguraciones();
$(document).ready(function(){
    if(localStorage.getItem("OpenProject") != null){
        AbrirProyecto(localStorage.getItem("OpenProject"));
    }else{
        $('#WorkSpaceStatus').attr('src','../img/Empty.png');
    }
    $('#AbrirModal').on('show.bs.modal',function () {
        ObtenerProyectos();
    });
    $('#AbrirModal').on('click','.btnAbrir',function (e) {
        if(confirm('¿Seguro que desea abrir este proyecto?')){
            $('#AbrirModal').modal('hide');
            localStorage.setItem("OpenProject",e.target.id);
            AbrirProyecto(e.target.id)
        }
    });
    $('#MenubtnCerrar').on('click',function () { 
        if(confirm("¿Seguro?")){
            localStorage.removeItem("OpenProject");
            setTimeout(document.location.reload(),1000);
        }

    });

});

function ObtenerProyectos() { 
    $.ajax({
        url: `http://${settings['Host']}:${settings['Port']}/Controles/MostrarTodos`,
        type: 'GET',
        success: function(answer){
            if (answer.length == 0){
                $('#Status').attr('src','../img/Empty.png');
                $('#lblStatus').html("¡Vacio!");
                return;
            }
            $('#AbrirModalBody').html("");
            answer.forEach(element => {
                $('#AbrirModalBody').append(`  
                <div class="border pt-3 pl-3 mt-3">
                <div class="row">
                    <div class="col-6">
                        <h3 class="text-muted">{0}</h3>
                        <p class="text-muted mt-4">Contiene {1} controladores</p>
                    </div>
                    <div class="col-6 text-right pr-5 pt-4  ">
                        <button id="{2}" class="btn btn-outline-success btnAbrir"><i class="fas fa-download pr-1"></i>Abrir</button>
                    </div>
                </div>
            </div>`.format(element['Nombre'],element['DriversCount'],element['Id']));
            });
        }
    }).fail(function () { 
        $('#Status').attr('src','../img/Error.png');
        $('#lblStatus').html("¡Error! Ha ocurrido un error");
     });
}

function AbrirProyecto(Id){
    console.log(settings);
    $.ajax({
        url: `http://${settings['Host']}:${settings['Port']}/Controles/Abrir/{0}`.format(Id),
        type: 'GET',
        beforeSend:function(){
            $('#WorkSpaceStatus').attr('src','../img/loading.gif');
            $('#WorkSpacelblStatus').html("Cargando...");
        },
        success: function(answer){
            if(answer.length == 0){
                $('#WorkSpaceStatus').attr('src','../img/Empty.png');
                $('#WorkSpacelblStatus').html("¡Vacio!");
                return;
            }
            $('#WorkSpace').html("");
            answer["Drivers"].forEach(element => {
                $('#WorkSpace').append(`
                <div class="border col-11 col-sm-11 col-md-6 col-lg-5 col-xl-4 driver p-1 row active" id="{0}">
                    <span class="Title">{1}</span>    
                    <div class="col-6 pt-2 pl-2 pb-0 mb-0" style="height: 85%;">
                        <div class="d-flex flex-row">
                            <span class="bd-highlight">Estado:</span><p id="DriverlblStatus" class="disconect bd-highlight mt-2_5 ml-1 mr-1"></p><span class="bd-highlight" id="DriverStatus">Desconocido</span> 
                        </div>
                        <img src="data:image;base64,{2}" class="img-fluid pt-0" style="height:85%; width:100%;" > 
                    </div>
                    <div class="col-6 pt-2 pl-2 pb-0 mb-0" style="height: 90%;">
                        <div class="d-flex justify-content-end mb-3" style="height=22px;">
                            <span class="bd-highlight" id="lbltimer">Actualizando en </span><span class="timer ml-2">{3}</span> <img src="../img/Loading.gif" class="d-none" width="25" height="22" id="timerStatus">
                        </div>
                        <div class="variables">
                            <img src="../img/Empty.png" width="100" heigth="100" class="img-fluid ml-auto mr-auto d-block">
                            <h4 class="text-muted text-center" id="WorkSpacelblStatus">¡Vacio!</h4>
                        </div>
                    </div>
                    <div class="col-12 pl-2 pb-0">
                        <p class="mb-0 mt-1 p-0" id="DriverLastUpdate">Ultima vez: {4}</p>
                    </div>
                    <input type="hidden" value="{5}" id="ID">
                    <input type="hidden" value="{6}" id="Token">
                    <input type="hidden" value="{7}" id="Time">
                </div> `.format(element["UnicID"],element["Nombre"],element["Image"],element["Time"],element["LastUpdate"],element["ID"],element["Token"],element["Time"]));
                var div = $(`#${element["UnicID"]}`).find('.variables');
                if(element["variables"].length == 0){
                    $(`#${element["UnicID"]}`).removeClass("active")
                    $(`#${element["UnicID"]}`).find('#lbltimer').html("¡No Hay Variables!")
                    $(`#${element["UnicID"]}`).find('.timer').addClass('d-none');
                    return;
                }
                div.html("");
                element["variables"].forEach(variable =>{
                    if(variable["Analogic"]){
                        div.append(`
                        <div class="d-flex flex-row  p-0 mt-0" id="{0}" >
                            <input type="hidden" value="{1}" id="UnicID">
                            <p class="bd-highlight p-0" style="height: 22px;width: 75%;overflow-y: auto;overflow-x: hidden;">{2}</p><span class="bd-highlight ml-3" id="VariableValue">{3}</span>
                            <input type="hidden" value="{4}" id="Nombre">
                            <input type="hidden" value="{5}" id="PIN">
                            <input type="hidden" value="{6}" id="Analogic">
                            <input type="hidden" value="{7}" id="DisplayColor">
                            <input type="hidden" value="{8}" id="Expresion">
                            <input type="hidden" value="{9}" id="Notificar">
                            <input type="hidden" value="{10}" id="Nivel">
                        </div>`.format(variable["UnicID"],variable["UnicID"],variable["Nombre"],variable["Valor"],variable["Nombre"],variable["PIN"],variable["Analogic"],variable["DisplayColor"],variable["Expresion"],variable["Notificar"],variable["Nivel"] ));
                    }else{
                        div.append(`
                        <div class="d-flex flex-row  p-0 mt-0" id="{0}" >
                            <input type="hidden" value="{1}" id="UnicID">
                            <p class="bd-highlight p-0" style="height: 22px;width: 75%;overflow-y: auto;overflow-x: hidden;">{2}</p><span class="bd-highlight ml-3 disconect" id="VariableValue"></span>
                            <input type="hidden" value="{3}" id="Nombre">
                            <input type="hidden" value="{4}" id="PIN">
                            <input type="hidden" value="{5}" id="Analogic">
                            <input type="hidden" value="{6}" id="DisplayColor">
                            <input type="hidden" value="{7}" id="Expresion">
                            <input type="hidden" value="{8}" id="Notificar">
                            <input type="hidden" value="{9}" id="Nivel">
                        </div>`.format(variable["UnicID"],variable["UnicID"],variable["Nombre"],variable["Nombre"],variable["PIN"],variable["Analogic"],variable["DisplayColor"],variable["Expresion"],variable["Notificar"],variable["Nivel"] ));

                    }
                   
                });
            });
            setInterval(function () {
               let drivers =  $('#WorkSpace').children('.active');
                for(var i = 0;i<drivers.length;i++){
                    let driver = $(`#${drivers[i].id}`);
                    let timer = driver.find('.timer');
                    let value = parseInt(timer.html()) - 1;
                    timer.html(value);
                    if(value == 0){
                        driver.removeClass('active');
                        LeerSensor(driver);
                    }
                   
                }

              },1000);
        }

    }).fail(function () { 
        $('#WorkSpaceStatus').attr('src','../img/Error.png');
        $('#WorkSpacelblStatus').html("¡Error! Ha ocurrido un error");
    });
}

function LeerSensor(driver){

    let ID = driver.find('#ID').val();
    let Token =  driver.find('#Token').val();
    let Time = driver.find('#Time').val();

    let variables = [];

    var variablesdiv = driver.find('.variables').children();
    for(var i = 0;i < variablesdiv.length;i++){
        let variablediv = $(`#${variablesdiv[i].id}`);
        let variable = {
            "UnicID":variablediv.find('#UnicID').val(),
            "Nombre": variablediv.find('#Nombre').val(),
            "PIN":variablediv.find('#PIN').val(),
            "Analogic":variablediv.find('#Analogic').val(),
            "DisplayColor":variablediv.find('#DisplayColor').val(),
            "Expresion":variablediv.find('#Expresion').val(),
            "Notificar":variablediv.find('#Notificar').val(),
            "Nivel":variablediv.find('#Nivel').val()
        };
        variables.push(variable);
    }
    $.ajax({
        url: `http://${settings['Host']}:${settings['Port']}/Controles/LeerSensor/{0}/{1}`.format(ID,Token),
        type: 'POST',
        data:  JSON.stringify(variables),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () { 
            driver.find('#lbltimer').html("Actualizando...");
            driver.find('.timer').addClass('d-none');
            driver.find('#timerStatus').removeClass('d-none');
        },success:function (answer) {
            if(answer.length == 0){
                driver.find('#DriverlblStatus').attr('class','offline bd-highlight mt-2_5 ml-1 mr-1');
                driver.find('#DriverStatus').html("Desonectado");
                return;
            }
            driver.find('#DriverlblStatus').attr('class','online bd-highlight mt-2_5 ml-1 mr-1');
            driver.find('#DriverStatus').html("Conectado");
            ActualizarVariables(answer,driver);
            driver.find('.timer').html(Time);
            driver.find('#lbltimer').html("Actualizando en");
            driver.find('.timer').removeClass('d-none');
            driver.find('#timerStatus').addClass('d-none');
            driver.addClass('active');
            var d = new Date();
            driver.find('#DriverLastUpdate').html("Ultima vez: {0}".format(d.toLocaleString()));
        }

    }).fail(function(){
        driver.find('#DriverlblStatus').attr('class','disconect bd-highlight mt-2_5 ml-1 mr-1');
        driver.find('#DriverStatus').html("Desconocido");
        driver.find('.timer').html(Time);
        driver.find('#lbltimer').html("Actualizando en");
        driver.find('.timer').removeClass('d-none');
        driver.find('#timerStatus').addClass('d-none');
        driver.addClass('active');

    });
}

function ActualizarVariables(variables,driver) {

    let variablesdiv = driver.find('.variables');
    for(let i = 0;i< variables.length;i++){
        let variable = variables[i];
        let variablediv = variablesdiv.find(`#${variable["UnicID"]}`);
        if(variable["Analogic"] == "true"){
            variablediv.find('#VariableValue').html(variable["Valor"]);
        }else{
            if(variable["Valor"] == 1){
                variablediv.find('#VariableValue').attr('class','bd-highlight ml-3 online');
            }else{
                variablediv.find('#VariableValue').attr('class','bd-highlight ml-3 disconect');
            }
        }
       
    }
  }


function ObtenerConfiguraciones() {
    $.ajax({
        url:'../setting.json',
        type:'POST',
        async:false,
        success:function(answer){
            window.settings = answer  
        }
    });
}

String.prototype.format = function() {
    a = this;
    for (k in arguments) {
      a = a.replace("{" + k + "}", arguments[k])
    }
    return a
  }

