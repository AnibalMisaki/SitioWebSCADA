var timer;
window.vfunciones;

export function Guardar(Proyecto,Notify = true) {
    $.ajax({
        url: `https://${settings['Host']}:${settings['Port']}/Controles/Guardar`,
        type: 'POST',
        data:  JSON.stringify(Proyecto),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend:function(request){
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            if(Notify ==  true){
                toastr.success("Por favor espere...","¡Guardando!",{
                    "progressBar":true,
                    "closeButton":true
                });
            }
        },
        success: function (answer) { 
            if(Notify ==  true && answer["Success"] == "true"){
                toastr.success("Guardado con exito","¡Exito!",{
                    "progressBar":true,
                    "closeButton":true
                });
            }
            if(Notify ==  true && answer["Success"] == "false"){
                toastr.error("¡Error! Cambios no pudieron ser guardados","¡Cambios sin guardar!",{
                    "progressBar":true,
                    "closeButton":true
                });
            }
        }
    }).fail(function (jqXHR) {
        toastr.error("¡Error! Cambios no pudieron ser guardados","¡Cambios sin guardar!",{
            "progressBar":true,
            "closeButton":true
        })
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
    });

}

export function ObtenerDispositivos(){ // Muestra los dispositivos dentro de Dispostivos Modal
    $('#DispositivosModalBody').html("");
    $('#DispositivosModalBody').append(`
        <div>
            <img src="../img/loading.gif" id="ModalDispositivosStatus" class="ml-auto mr-auto d-block" >
            <h5 class="text-muted text-center" id="ModalDispositivoslblStatus">Obteniendo Dispositivos...</h5>
        </div>
    `);
    let SessionProject = JSON.parse(sessionStorage.getItem("SessionProject"));
    if (SessionProject == null) {
        $('#DriversCount').html("Total: 0 Dispositivos");
        $('#ModalDispositivosStatus').attr('src', '../img/Error.png');
        $('#ModalDispositivoslblStatus').html("¡Aun no hay nada!");
        return;
    }
    if (SessionProject["Drivers"].length == 0) {
        $('#DriversCount').html("Total: 0 Dispositivos");
        $('#ModalDispositivosStatus').attr('src', '../img/Empty.png');
        $('#ModalDispositivoslblStatus').html("¡Vacio!");
        return;
    }
    $('#DispositivosModalBody').html("");
    $('#DriversCount').html("Total: {0} Dispositivos".format(SessionProject["Drivers"].length));
    SessionProject["Drivers"].forEach(element => {
        element["ID"] = element["ID"].substr(0, 20) + "<br/>" + element["ID"].substr(20, 40);
        element["Token"] = element["Token"].substr(0, 20) + "<br/>" + element["Token"].substr(20, 40);
        $('#DispositivosModalBody').append(
            `<div class="row p-0 ml-2 border col-12 mt-3 pb-0 mb-0 Driver" style="position:relative; max-height:242px;">
                <div class="col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 p-0 DriverImage" style="height:240px;">
                    <img src="data:image;base64,{0}" class="img-fluid pt-0 DriverImage ml-auto mr-auto d-block" style="height:236px;" > 
                </div>
                <div class="pt-3 pl-2 col-5 col-sm-5 col-md-5 col-lg-6 col-xl-6 p-0 DriverInfo" style="height:248px;font-size:calc(.85em + 0.15vmin);">
                    <div class="d-flex flex-row">
                        <p class="mr-2">Nombre: </p><span class="content">{1}</span>
                    </div>
                    <div class="d-flex flex-row">
                        <p class="mr-2">ID: </p><span class="content">{2}</span>
                    </div>
                    <div class="d-flex flex-row">
                        <p class="mr-2">Token: </p><span class="content">{3}</span>
                    </div>
                    <p>Tiempo: <span class="content">{4} Segundos</span> </p>
                    <p># Variables: {5}</p>
                </div>
                <div class="p-0 col-3 col-sm-3 col-md-3 col-lg-2 col-xl-2 DriverActions" style="height:240px;">
                    <button id="{6}" class="btn d-block DispositivosModalbtnCopiar"><span><img src="../img/Copiar.png" alt=""></span></button>
                    <div class="d-flex flex-row mt-5 w-100 justify-content-end DriversActionsII">
                        <button id="{7}" class="btn DispositivosModalbtnEditar"><span><img class=" p-0 img-fluid" src="../img/Editar.png" alt=""></span></button>
                        <button id="{8}" class="btn DispositivosModalbtnEliminar"><span><img class="p-0" src="../img/Eliminar.png" alt=""></span></button>
                    </div>
                </div>
            </div>`.format(element["Image"], element["Nombre"], element["ID"], element["Token"], element["Time"], element["variables"].length, element["UnicID"], element["UnicID"], element["UnicID"]));
    });            
} 

export function ObtenerProyectos(){
    return new Promise(resolve => {
        $.ajax({
            url: `https://${settings['Host']}:${settings['Port']}/Controles/MostrarTodos`,
            type: 'GET',
            beforeSend: function(request) {
                let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
                request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            },
            success: function(answer){
                resolve(answer);
            }
        }).fail(function(jqXHR){
            let statusCode = jqXHR.status;
            if(statusCode == 401){
                alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
                sessionStorage.removeItem("Session");
                sessionStorage.removeItem("SessionProject");
                setTimeout(
                    location.href ="../index.html"
                    ,1000)
            }

           resolve(null);
        });
    });
}

export function ObtenerProyectosAll(){
    return new Promise(resolve => {
        $.ajax({
            url: `https://${settings['Host']}:${settings['Port']}/Controles/ObtenerTodos`,
            type: 'GET',
            beforeSend:function(request){
                let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
                request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            },
            success: function(answer){
              resolve(answer);
              
            }
        }).fail(function(jqXHR){
            let statusCode = jqXHR.status;
            if(statusCode == 401){
                alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
                sessionStorage.removeItem("Session");
                sessionStorage.removeItem("SessionProject");
                setTimeout(
                    location.href ="../index.html"
                    ,1000)
        }
           reject(null);
        });
    });
}

export async function ObtenerProyectosToOpen() { 
    
    let result =  await ObtenerProyectos();
    
    if(result == null){
        $('#ModalAbrirStatus').attr('src','../img/Error.png ');
        $('#ModalAbrirlblStatus').html("¡Error! Ha ocurrido un error");
        return;
    }
    if (result.length == 0){
        $('#ModalAbrirStatus').attr('src','../img/Empty.png');
        $('#ModalAbrirlblStatus').html("¡Vacio!");
        return;
    }
    $('#AbrirModalBody').html("");
    result.forEach(element => {
        $('#AbrirModalBody').append(`
        <div class="border pt-3 pl-3 mt-3 pb-2">
            <div class="row">
                <div class="col-8">
                    <textarea class="my-auto content-XL font" style="resize: none; border:none;width:95.0%; font-size:calc(1em + 0.35vmin)"
                        readonly>{0}</textarea>
                    <textarea class="my-auto content font" style="resize: none; border:none;width: 100.0%; font-size:calc(0.75em + 0.15vmin)"
                        readonly>Contiene {1} controladores</textarea>
                </div>
                <div class="col-4 text-right pr-5 my-auto textarea ">
                    <button id="{2}" class="btn btn-outline-success btnAbrir"><i
                            class="fas fa-download pr-1"></i>Abrir</button>
                </div>
            </div>
        </div>`.format(element['Nombre'],element['DriversCount'],element['Id']));
    });

}

export async function ObtenerProyectosToDelete() { 

    $('#EliminarModalBody').html("");
    $('#EliminarModalBody').append(`
        <img src="../img/loading.gif" id="ModalEliminarStatus" class="ml-auto mr-auto d-block" >
        <h5 class="text-muted text-center" id="ModalEliminarlblStatus">Cargando...</h5>
    `);

    let result =  await ObtenerProyectos();

    if(result == null){
        $('#ModalEliminarStatus').attr('src','../img/Error.png');
        $('#ModalEliminarlblStatus').html("¡Error! Ha ocurrido un error");
        return;
    }

    if (result.length == 0){
        $('#ModalEliminarStatus').attr('src','../img/Empty.png');
        $('#ModalEliminarlblStatus').html("¡Vacio!");
        return;
    }
    $('#EliminarModalBody').html("");
    result.forEach(element => {
        $('#EliminarModalBody').append(` 
        <div class="border pt-3 pl-3 mt-3 pb-2">
            <div class="row">
                <div class="col-7">
                    <textarea class="my-auto content-XL font textarea-h3" style="width:95.0%; font-size:calc(1em + 0.35vmin)"
                        readonly>{0}</textarea>
                    <textarea class="my-auto content font textarea" style="width: 115.0%; font-size:calc(0.75em + 0.15vmin)"
                        readonly>Contiene {1} controladores</textarea>
                </div>
                <div class="col-5 text-right pr-5 my-auto textarea ">
                    <button id="{2}" class="btn btn-outline-danger btnEliminar"><i
                            class="fas fa-trash pr-1"></i>Eliminar</button>
                </div>
            </div>
        </div>`.format(element['Nombre'],element['DriversCount'],element['Id']));
    });
}

export async function ObtenerProyectosToImport(){

    let result = await ObtenerProyectosAll();
    if(result == null){
        $('#ImportarDispositivoModalStatus').attr('src','../img/Error.png');
        $('#ImportarDispositivoModallblStatus').html('¡Error! Ha ocurrido un error');
        return;
    }

    if(result.length == 0){
        $('#ImportarDispositivoModalStatus').attr('src','../img/Empty.png');
        $('#ImportarDispositivoModallblStatus').html('¡Vacio! No hay nada que importar');
        return;
    }
    $('#ImportarDispositivoModalcmbProyecto').html("");
    result.forEach( p => {
        $('#ImportarDispositivoModalcmbProyecto').append(`
            <option value="{0}">{1}</option>
        `.format(p["Id"],p["Nombre"]));
    });
    
    $('#ImportarDispositivoModalcmbProyecto').data('data',result);
    $('#ImportarDispositivoModalcmbProyecto').val(result[0]["Id"]);
    MostrarDispositivosToImport(result[0]["Id"]);
}

export function MostrarDispositivosToImport(GUID){
    let Proyecto =  (($('#ImportarDispositivoModalcmbProyecto').data('data')).filter( x => x["Id"] == GUID))[0] ;
    
    $('#ImportarDispositivoModalBody').html("");
    Proyecto["Drivers"].forEach( d => {
        $('#ImportarDispositivoModalBody').append(
            `<div class="row p-0 ml-2 border col-12 mt-3 pb-0 mb-0 Driver" style="position:relative; max-height:200px;"  >
                <div class="col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 p-0" style="height:200px;">
                    <img src="data:image;base64,{0}" class="img-fluid pt-0" style="height:198px;" > 
                </div>
                <div class="pt-3 pl-2 col-5 col-sm-5 col-md-5 col-lg-6 col-xl-6 p-0" style="height:200px;">
                    <div class="d-flex flex-row">
                        <p class="mr-2">Nombre: </p><span class="content">{1}</span>
                    </div>
                    <div class="d-flex flex-row">
                        <p class="mr-2">ID: </p><span class="content">{2}</span>
                    </div>
                    <div class="d-flex flex-row">
                        <p class="mr-2">Token: </p><span class="content">{3}</span>
                    </div>
                    <p>Tiempo: <span class="content">{4} Segundos</span> </p>
                </div>
                <div class="p-0 col-3 col-sm-3 col-md-3 col-lg-2 col-xl-2" style="height:200px;">
                    <div class="d-flex flex-row mt-5 w-100 justify-content-end">
                        <button id="{7}" width="35" height="35" class="btn ImportarDispositivoModalbtnImportar"><span><img class=" p-0 img-fluid" src="../img/Importar-XL.png" alt=""></span></button>
                    </div>
                </div>
            </div>`.format(d["Image"],d["Nombre"], d["ID"], d["Token"], d["Time"], d["variables"].length, d["UnicID"], d["UnicID"], d["UnicID"]));
    });

}

export function ImportarDispositivo(GUID){

    let ProyectoGUID = $('#ImportarDispositivoModalcmbProyecto').val();
    let dispositivo = (($('#ImportarDispositivoModalcmbProyecto').data('data')).filter( x => x["Id"] == ProyectoGUID))[0]["Drivers"].filter( y => y["UnicID"] == GUID)[0] ;
    if(dispositivo == null || dispositivo == undefined){
        toastr.error("Dispositivo no pudo ser importado","¡Error!",{
            "progressBar":true,
            "closeButton":true
        });
        return;
    }
    $('#AgregarDispositivoModaltxtNombre').val("{0}-{1}".format(dispositivo["Nombre"],"copia"));
    $('#AgregarDispositivoModaltxtID').val(dispositivo["ID"]);
    $('#AgregarDispositivoModaltxtToken').val(dispositivo["Token"]);
    $('#AgregarDispositivoModaltxtTiempo').val(dispositivo["Time"]);

}

export function AbrirProyecto(GUID){
    $.ajax({
        url: `https://${settings['Host']}:${settings['Port']}/Controles/Abrir/{0}`.format(GUID),
        type: 'GET',
        beforeSend:function(request){
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            $('#WorkSpaceStatus').attr('src','../img/loading.gif');
            $('#WorkSpacelblStatus').html("Cargando...");
        },
        success: function(answer){
            if(answer.length == 0){
                $('#WorkSpaceStatus').attr('src','../img/Empty.png');
                $('#WorkSpacelblStatus').html("¡Vacio!");
                return;
            }
            sessionStorage.setItem("SessionProject",JSON.stringify(answer));
            MostrarDispositivos(answer);
        }
    }).fail(function (jqXHR) { 
        $('#WorkSpaceStatus').attr('src','../img/Error.png');
        $('#WorkSpacelblStatus').html("¡Error! Ha ocurrido un error");
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
    });
}

export function EliminarProyecto(GUID){
    $.ajax({
        url: `https://${settings['Host']}:${settings['Port']}/Controles/Eliminar/{0}`.format(GUID),
        type: 'GET',
        beforeSend:function(request){
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            toastr.info("Por favor espere...","¡Eliminando!",{
                "progressBar":true,
                "closeButton":true
            });
        },success:function(answer){
            if(answer["Success"] == "false"){
                toastr.error("Fallo al eliminar","¡Error!",{
                    "progressBar":true,
                    "closeButton":true
                });
            }
            if(answer["Success"] == "true"){
                toastr.success("Eliminado correctamente","¡Exito!",{
                    "progressBar":true,
                    "closeButton":true
                });
                ObtenerProyectosToDelete();
            }
        }
    }).fail(function(jqXHR){
        toastr.error("Fallo al eliminar","¡Error!",{
            "progressBar":true,
            "closeButton":true
        });
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
    });
}

export function MostrarDispositivos(Dispositivos){

    $('#WorkSpace').html("");

    $('#WorkSpace').append(`
        <img src="../img/loading.gif" class="mt-5" alt="" id="WorkSpaceStatus">
        <h4 class="text-muted col-12 text-center" id="WorkSpacelblStatus">Cargando...</h4>  
    `);

    if(timer != undefined){
        clearInterval(timer);
    }
    if(Dispositivos["Drivers"].length == 0){
        $('#WorkSpaceStatus').attr('src','../img/Empty.png');
        $('#WorkSpacelblStatus').html("¡Vacio!");
        return;
    }
    $('#WorkSpace').html("");
    Dispositivos["Drivers"].forEach(element => {
        $('#WorkSpace').append(`
        <div class="border col-11 col-sm-11 col-md-6 col-lg-5 col-xl-4 driver p-1 row active" id="{0}" style="max-width:387px;">
            <span class="Title">{1}</span>    
            <div class="col-6 pt-2 pl-2 pb-0 mb-0" style="height: 85%;">
                <div class="d-flex flex-row" style="width:115%; font-size:calc(0.85em + 0.15vmin);">
                    <span class="bd-highlight">Estado:</span><p id="DriverlblStatus" class="disconect bd-highlight mt-2_5 ml-1 mr-1"></p><span class="bd-highlight" id="DriverStatus">Desconocido</span> 
                </div>
                <img src="data:image;base64,{2}" id="{3}" class="img-fluid pt-0 DriverPrevImage" style="height:85%; width:100%;cursor:pointer;" > 
                <input type="file" class="d-none DriverInputImage" accept=".jpeg,.jpg,.png" id="{4}" >  
            </div>
            <div class="col-6 pt-2 pl-2 pb-0 mb-0" style="height: 90%;">
                <div class="d-flex justify-content-end mb-3" style="height=22px;">
                    <span class="bd-highlight" id="lbltimer">Actualizando en </span><span class="timer ml-2">{5}</span> <img src="../img/Loading.gif" class="d-none" width="25" height="22" id="timerStatus">
                </div>
                <div class="variables">
                    <img src="../img/Empty.png" width="100" heigth="100" class="img-fluid ml-auto mr-auto d-block">
                    <h4 class="text-muted text-center" id="WorkSpacelblStatus">¡Vacio!</h4>
                </div>
            </div>
            <div class="col-12 pl-2 pb-0">
                <p class="mb-0 mt-1 p-0" id="DriverLastUpdate">Última vez: {6}</p>
            </div>
            <input type="hidden" value="{7}" id="ID">
            <input type="hidden" value="{8}" id="Token">
            <input type="hidden" value="{9}" id="Time">
        </div> `.format(element["UnicID"],element["Nombre"],element["Image"],element["UnicID"],element["UnicID"],element["Time"],element["LastUpdate"],element["ID"],element["Token"],element["Time"]));
        var div = $(`#${element["UnicID"]}`).find('.variables');
        if(element["variables"].length == 0){
            $(`#${element["UnicID"]}`).removeClass("active")
            $(`#${element["UnicID"]}`).find('#lbltimer').html("¡No Hay Variables!")
            $(`#${element["UnicID"]}`).find('.timer').addClass('d-none');
            return;
        }
        if((element["variables"].filter(x => x["IsOutput"] == false).length == 0 )){
            $(`#${element["UnicID"]}`).removeClass('active');
            $(`#${element["UnicID"]}`).find('#lbltimer').html("")
            $(`#${element["UnicID"]}`).find('.timer').addClass('d-none');
        }
        div.html("");
        element["variables"].forEach(variable =>{
            if(variable["Analogic"] && !variable["IsOutput"]){
                div.append(`
                <div class="d-flex flex-row  p-0 mt-0 input" id="{0}" >
                    <input type="hidden" value="{1}" id="UnicID">
                    <p class="bd-highlight p-0 vTitle">{2}</p><span class="bd-highlight ml-3" id="VariableValue">{3}</span>
                    <input type="hidden" value="{4}" id="Nombre">
                    <input type="hidden" value="{5}" id="PIN">
                    <input type="hidden" value="{6}" id="Analogic">
                    <input type="hidden" value="{7}" id="DisplayColor">
                    <input type="hidden" value="{8}" id="Expresion">
                    <input type="hidden" value="{9}" id="Notificar">
                    <input type="hidden" value="{10}" id="Nivel">
                    <input type="hidden" value="{11}" id="IsOutput">
                    <input type="hidden" value="{12}" id="Expresion">
                </div>`.format(variable["UnicID"],variable["UnicID"],variable["Nombre"],variable["Valor"],variable["Nombre"],variable["PIN"],variable["Analogic"],variable["DisplayColor"],variable["Expresion"],variable["Notificar"],variable["Nivel"],variable["IsOutput"],variable["Expresion"] ));
            }if(variable["Analogic"] && variable["IsOutput"] ){
                div.append(`
                <div class="d-flex flex-row  p-0 mt-0 output" id="{0}" >
                    <input type="hidden" value="{1}" id="UnicID">
                    <p class="bd-highlight p-0 vTitle">{2}</p><span class="bd-highlight ml-3"><input id="{3}" type="number" min="0" max="255" value="{4}" class="form-control vEscrituraA" ></span>
                    <input type="hidden" value="{5}" id="Nombre">
                    <input type="hidden" value="{6}" id="PIN">
                    <input type="hidden" value="{7}" id="Analogic">
                    <input type="hidden" value="{8}" id="DisplayColor">
                    <input type="hidden" value="{9}" id="Expresion">
                    <input type="hidden" value="{10}" id="Notificar">
                    <input type="hidden" value="{11}" id="Nivel">
                    <input type="hidden" value="{12}" id="IsOutput">
                    <input type="hidden" value="{13}" id="Expresion">
                </div>`.format(variable["UnicID"],variable["UnicID"],variable["Nombre"],variable["UnicID"],variable["Valor"],variable["Nombre"],variable["PIN"],variable["Analogic"],variable["DisplayColor"],variable["Expresion"],variable["Notificar"],variable["Nivel"],variable["IsOutput"],variable["Expresion"] ));
            }
            if(!variable["Analogic"] && !variable["IsOutput"]){
                div.append(`
                <div class="d-flex flex-row  p-0 mt-0 input" id="{0}" >
                    <input type="hidden" value="{1}" id="UnicID">
                    <p class="bd-highlight p-0 vTitle">{2}</p><span class="bd-highlight ml-3 digital" style="background:{3};" id="VariableValue"></span>
                    <input type="hidden" value="{4}" id="Nombre">
                    <input type="hidden" value="{5}" id="PIN">
                    <input type="hidden" value="{6}" id="Analogic">
                    <input type="hidden" value="{7}" id="DisplayColor">
                    <input type="hidden" value="{8}" id="Expresion">
                    <input type="hidden" value="{9}" id="Notificar">
                    <input type="hidden" value="{10}" id="Nivel">
                    <input type="hidden" value="{11}" id="IsOutput">
                    <input type="hidden" value="{12}" id="Expresion">
                </div>`.format(variable["UnicID"],variable["UnicID"],variable["Nombre"],variable["Valor"] == 1 || variable["Valor"] == "1" ? new RGBColor(variable["DisplayColor"]).toHex():"grey",variable["Nombre"],variable["PIN"],variable["Analogic"],variable["DisplayColor"],variable["Expresion"],variable["Notificar"],variable["Nivel"],variable["IsOutput"],variable["Expresion"] ));
            }if(!variable["Analogic"] && variable["IsOutput"] ){
                div.append(`
                <div class="d-flex flex-row  p-0 mt-0 output" id="{0}" >
                    <input type="hidden" value="{1}" id="UnicID">
                    <p class="bd-highlight p-0 vTitle">{2}</p><span class="bd-highlight ml-3" id="VariableValue"><button id="{3}" class="btn {4} vEscrituraD ">{5}</button></span>
                    <input type="hidden" value="{6}" id="Nombre">
                    <input type="hidden" value="{7}" id="PIN">
                    <input type="hidden" value="{8}" id="Analogic">
                    <input type="hidden" value="{9}" id="DisplayColor">
                    <input type="hidden" value="{10}" id="Expresion">
                    <input type="hidden" value="{11}" id="Notificar">
                    <input type="hidden" value="{12}" id="Nivel">
                    <input type="hidden" value="{13}" id="IsOutput">
                    <input type="hidden" value="{14}" id="Expresion">
                </div>`.format(variable["UnicID"],variable["UnicID"],variable["Nombre"],variable["UnicID"],variable["Valor"] ==  "1" ? "btn-success":"btn-danger",variable["Valor"] ==  "1" ? "On":"Off",variable["Nombre"],variable["PIN"],variable["Analogic"],variable["DisplayColor"],variable["Expresion"],variable["Notificar"],variable["Nivel"],variable["IsOutput"],variable["Expresion"] ));
            }    
        });
    });
    timer = timer = setInterval(function () {
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
    },1000); //Cada segundo se activara y obtendra los div con la clase active y restara 1 a su contador 
}

export function LeerSensor(driver){
    let GUID = driver[0].id;
    let ID = driver.find('#ID').val();
    let Token =  driver.find('#Token').val();
    let Time = driver.find('#Time').val();

    let variables = [];

    var variablesdiv = driver.find('.variables').children(".input");
    for(var i = 0;i < variablesdiv.length;i++){
        let variablediv = $(`#${variablesdiv[i].id}`);
        let variable = {
            "UnicID":variablediv.find('#UnicID').val(),
            "Nombre": variablediv.find('#Nombre').val(),
            "PIN":variablediv.find('#PIN').val(),
            "Analogic":variablediv.find('#Analogic').val() == "true" ? true : false,
            "DisplayColor":variablediv.find('#DisplayColor').val(),
            "Expresion":variablediv.find('#Expresion').val(),
            "Notificar":variablediv.find('#Notificar').val(),
            "Nivel":variablediv.find('#Nivel').val(),
            "IsOutput":variablediv.find('#IsOutput').val() == "true" ? true : false
        };
        variables.push(variable);
    }
    $.ajax({
        url: `https://${settings['Host']}:${settings['Port']}/Controles/LeerSensor/{0}/{1}`.format(ID,Token),
        type: 'POST',
        data:  JSON.stringify(variables),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function (request) { 
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            driver.find('#lbltimer').html("Actualizando...");
            driver.find('.timer').addClass('d-none');
            driver.find('#timerStatus').removeClass('d-none');
        },success:function (answer) {
            if(answer.length == 0){
                driver.find('#DriverlblStatus').attr('class','offline bd-highlight mt-2_5 ml-1 mr-1');
                driver.find('#DriverStatus').html("Desconectado");
                driver.find('.timer').html(Time);
                driver.find('#lbltimer').html("Actualizando en");
                driver.find('.timer').removeClass('d-none');
                driver.find('#timerStatus').addClass('d-none');
                driver.addClass('active');
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
            let project = JSON.parse(sessionStorage.getItem("SessionProject"));
            let dispositivo = project["Drivers"].filter(d => d["UnicID"] == GUID)[0];
            let id = project["Drivers"].indexOf(project["Drivers"].filter(x => x["UnicID"] == GUID )[0]);
            answer.forEach(v => {
                let id = dispositivo["variables"].indexOf(dispositivo["variables"].filter(x => x["UnicID"] == v["UnicID"])[0]);
                let vTemp = dispositivo["variables"].filter(x => x["UnicID"] == v["UnicID"])[0];
                vTemp["Valor"] =  v["Expresion"] != "" ? eval(v["Expresion"].replace(/x/gi,v["Valor"])) : v["Valor"];
                dispositivo["variables"].splice(id,1,vTemp);
            });
            dispositivo["LastUpdate"] = d.toLocaleString();
            project["Drivers"].splice(id,1,dispositivo); 
            sessionStorage.setItem("SessionProject",JSON.stringify(project));
        }

    }).fail(function(jqXHR){
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
        driver.find('#DriverlblStatus').attr('class','disconect bd-highlight mt-2_5 ml-1 mr-1');
        driver.find('#DriverStatus').html("Desconocido");
        driver.find('.timer').html(Time);
        driver.find('#lbltimer').html("Actualizando en");
        driver.find('.timer').removeClass('d-none');
        driver.find('#timerStatus').addClass('d-none');
        driver.addClass('active');

    });
}

export function ActualizarVariable(GUID,ID,Token,variable,previousValue) { 
    let driver = $(`#${GUID}`);
    let variablediv = driver.find(`.variables div#${variable["UnicID"]}`);
    let Time = driver.find('.timer').html();
    driver.removeClass('active');
    $.ajax({
        url: `https://${settings['Host']}:${settings['Port']}/Controles/ActualizarVariable/{0}/{1}`.format(ID,Token),
        type: 'POST',
        data:  JSON.stringify(variable),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function (request) { 
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            driver.find('#lbltimer').html("Cambiando...");
            driver.find('.timer').addClass('d-none');
            driver.find('#timerStatus').removeClass('d-none');
        },
        success:function (answer) {
            if(answer["success"] == "true"){
                driver.find('#DriverlblStatus').attr('class','online bd-highlight mt-2_5 ml-1 mr-1');
                driver.find('#DriverStatus').html("Conectado");
                if(variable["Analogic"]){
                    let input =  variablediv.find('.vEscrituraA');
                    input.data('prev_val',variable["Valor"]);
                }
                if(!variable["Analogic"]){
                    let button = variablediv.find('.vEscrituraD');
                    if(parseInt(variable["Valor"]) == 1){
                        button.attr('class','btn btn-success vEscrituraD');
                        button.html('On');
                    }
                    if(parseInt(variable["Valor"]) == 0){
                        button.attr('class','btn btn-danger vEscrituraD');
                        button.html('Off');
                    }
                }
            }else{
                if(variable["Analogic"]){
                    let input =  variablediv.find('.vEscrituraA');
                    input.val(input.data('prev_val'));  
                }
                driver.find('#DriverlblStatus').attr('class','offline bd-highlight mt-2_5 ml-1 mr-1');
                driver.find('#DriverStatus').html("Desconectado");
                toastr.error("Variable no pudo ser actualizada","¡Error!",{
                    "closeButton":true,
                    "progressBar":true
                });
            }
            let driver_json = (JSON.parse(sessionStorage.getItem("SessionProject"))["Drivers"]).filter( y => y["UnicID"] == GUID)[0]
            if((driver_json["variables"].filter(x => x["IsOutput"] == false).length > 0 )){
                driver.find('.timer').html(Time);
                driver.find('#lbltimer').html("Actualizando en");
                driver.find('.timer').removeClass('d-none');
                driver.find('#timerStatus').addClass('d-none');
                driver.addClass('active');
            }else{
                driver.find('#lbltimer').html("");
                driver.find('#timerStatus').addClass('d-none');
            }
           
        }
        
    }).fail(function(jqXHR){
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
        if(variable["Analogic"]){
            let input =  variablediv.find('.vEscrituraA');
            input.val(input.data('prev_val'));
        }
        toastr.error("Variable no pudo ser actualizada","¡Error!",{
            "closeButton":true,
            "progressBar":true
        });
        driver.find('#DriverlblStatus').attr('class','disconect bd-highlight mt-2_5 ml-1 mr-1');
        driver.find('#DriverStatus').html("Desconocido");
        driver.find('.timer').html(Time);
        driver.find('#lbltimer').html("Actualizando en");
        driver.find('.timer').removeClass('d-none');
        driver.find('#timerStatus').addClass('d-none');
        driver.addClass('active');
    });
}

export function ActualizarVariables(variables,driver) {
    let variablesdiv = driver.find('.variables');
    for(let i = 0;i< variables.length;i++){
        let variable = variables[i];
        let variablediv = variablesdiv.find(`#${variable["UnicID"]}`);
        if(variable["Analogic"]){
            if(variable["Expresion"] != ""){
                variablediv.find('#VariableValue').html(eval(variable["Expresion"].replace(/x/gi,variable["Valor"])));
            }else{
                variablediv.find('#VariableValue').html(variable["Valor"]);
            }
            if(variable["Notificar"] != "" && variable["Notificar"] != null){
                let result = eval("{0}{1}".format( variable["Expresion"] != "" ? eval(variable["Expresion"].replace(/x/gi,variable["Valor"])) : variable["Valor"],variable["Notificar"].replace('-',' ').trim()));
                if(result){
                    var date = new Date();
                    let condicion = "{0}{1}".format(variable["Expresion"] != "" ? eval(variable["Expresion"].replace(/x/gi,variable["Valor"])) : variable["Valor"],variable["Notificar"].replace('-',' ').trim());
                    let reporte = {
                        "Nivel":variable["Nivel"],
                        "Fecha":formatDate(date),
                        "Hora":date.toLocaleTimeString(),
                        "Usuario":(JSON.parse(sessionStorage.getItem('Session')))["Usuario"],
                        "NombreDispositivo":driver.find('.Title').html(),
                        "NombreVariable":variable["Nombre"],
                        "Mensaje":`Variable "{0}" ha lanzado una alerta`.format(variable["Nombre"]),
                        "Valor":variable["Expresion"] != "" ? eval(variable["Expresion"].replace(/x/gi,variable["Valor"])) : variable["Valor"] ,
                        "Condicion":condicion
                    }
                    NuevoReporte(reporte);
                    switch (variable["Nivel"]){
                        case "aqua":
                            toastr.info(
                                `Variable <b>"{0}"</b> perteneciente a: <b>"{1}"</b> ha lanzado una alerta informativa, Debido al cumplimiento de la condicion: <b>{2}</b>`.format(variable["Nombre"],driver.find('.Title').html(),condicion),
                                "Alerta Informativa",{
                                    "closeButton":true,
                                    "progressBar":true
                                })
                            break;
                        case "green":
                                toastr.success(
                                    `Variable <b>"{0}"</b> perteneciente a: <b>"{1}"</b> ha lanzado una alerta normal, Debido al cumplimiento de la condicion: <b>{2}</b>`.format(variable["Nombre"],driver.find('.Title').html(),condicion),
                                    "Alerta Normal",{
                                        "closeButton":true,
                                        "progressBar":true
                                    })
                            break;
                        case "orange":
                                toastr.warning(
                                    `Variable <b>"{0}"</b> perteneciente a: <b>"{1}"</b> ha lanzado una alerta de advertencia, Debido al cumplimiento de la condicion: <b>{2}</b>`.format(variable["Nombre"],driver.find('.Title').html(),condicion),
                                    "Alerta Advertencia",{
                                        "closeButton":true,
                                        "progressBar":true
                                    })
                            break;
                        case "red":
                                toastr.error(
                                    `Variable <b>"{0}"</b> perteneciente a: <b>"{1}"</b> ha lanzado una alerta critica, Debido al cumplimiento de la condicion: <b>{2}</b>`.format(variable["Nombre"],driver.find('.Title').html(),condicion),
                                    "Alerta Critica",{
                                        "closeButton":true,
                                        "progressBar":true
                                    })
                            break;

                    }

                }
            }
        }else{
            if(variable["Valor"] == 1){
                variablediv.find('#VariableValue').css('background',new RGBColor(variable["DisplayColor"]).toHex());
            }else{
                variablediv.find('#VariableValue').css('background','grey');
            }
        }
       
    }
}

export function NuevoReporte(reporte) { 
    $.ajax({
        url:`https://${settings['Host']}:${settings['Port']}/Reportes/NuevoReporte`,
        type:'POST',
        data:  JSON.stringify(reporte),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend:function(request){
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
        },
        success: function(answer){
           if(!answer["Success"]){
                toastr.error("Error al crear un nuevo reporte","¡Error!",{
                    "closeButton":true,
                    "progressBar":true
                });
           }
        }
    }).fail(function (jqXHR){
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
        toastr.error("Error al crear un nuevo reporte","¡Error!",{
            "closeButton":true,
            "progressBar":true
        });
    })   

}

export function ObtenerVariablesFunciones(ID,Token) { 
    return new Promise(resolve =>{
        $.ajax({
            url:`https://${settings['Host']}:${settings['Port']}/Controles/ObtenerVariablesFunciones/{0}/{1}`.format(ID,Token),
            type:'GET',
            beforeSend:function(request){
                let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
                request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
                $('#AgregarVariableModalStatusDiv').removeClass('d-none');
                $('#AgregarVariableModalFormDiv').addClass('d-none');
                $('#AgregarVariableModalStatus').attr('src','../img/loading.gif');
                $('#AgregarVariableModallblStatus').html("Cargando...");
            },
            success: function(answer){
                if(answer.length == 0){
                    $('#AgregarVariableModalStatus').attr('src','../img/Empty.png');
                    $('#AgregarVariableModallblStatus').html("¡Vacio!");
                    window.vfunciones = answer;
                    resolve(answer);
                    return;
                }
                $('#AgregarVariableModalStatusDiv').addClass('d-none');
                $('#AgregarVariableModalFormDiv').removeClass('d-none');
                window.vfunciones = answer;
                resolve(answer);
            }
        }).fail(function (jqXHR){
            let statusCode = jqXHR.status;
            if(statusCode == 401){
                alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
                sessionStorage.removeItem("Session");
                sessionStorage.removeItem("SessionProject");
                setTimeout(
                    location.href ="../index.html"
                    ,1000)
        }
            $('#AgregarVariableModalStatus').attr('src','../img/Error.png');
            $('#AgregarVariableModallblStatus').html("¡Error! Ha ocurrido un error");
            window.vfunciones = null;
            resolve(new Array());
        })
    });
}

export function ActualizarVariablesFunciones(Filter,vfunciones = window.vfunciones){
    let array = Filter == "true" ? vfunciones.filter(FiltroFunciones) : vfunciones.filter(FiltroVariables);
    $('#AgregarVariableModalcmbVariable').html("");
    array.forEach( element => {
        $('#AgregarVariableModalcmbVariable').append(
            `<option value="{0}">{1}</option>`.format(element["PIN"],element["Nombre"])
        );
    });
}

export function ValidarVariable(variable,IsEdit = false) { 
    let temp = {
        "UnicID":GenerateGUID(),
        "Nombre":"",
        "PIN":variable["PIN"],
        "Analogic":variable["Señal"] == "true" ? true : false,
        "IsOutput":variable["Tipo"] == "true" ? true : false,
        "Notificar":"",
        "Nivel":"",
        "Valor":0,
        "DisplayColor":"",
        "Expresion":""

    };
    if(variable["Nombre"] == "" || IsNumeric(variable["Nombre"])){
        toastr.warning("Nombre Invalido","¡Alto!",{
            "closeButton":true,
            "progressBar":true,
        })
        return false; 
    }
    temp["Nombre"] = variable["Nombre"];
    if(variable["Color"] != undefined){
        temp["DisplayColor"] = variable["Color"];
    }
    if(variable["Expresion"] != "" && variable["Expresion"] != undefined){
        if(!variable["Expresion"].toLocaleLowerCase().includes('x')){
            toastr.warning("Expresión debe incluir 'x'","¡Alto!",{
                "closeButton":true,
                "progressBar":true,
            })
            return false;
        }
        let tempvar = variable["Expresion"].replace(/x/gi,255).replace(/(?![x])[A-Za-z]/gi,' ').trim();
        let result;
        try{
            result = eval(tempvar)
        }catch(error){
            result = Infinity;
        }
        if(!isFinite(result)){
            toastr.warning("Expresión Ilogica","¡Alto!",{
                "closeButton":true,
                "progressBar":true,
            })
            return false;
        }
        temp["Expresion"] = variable["Expresion"];
    }
    if(variable["NotificarCheck"] != undefined){
        if(variable["NotificarValor"] == ""){
            toastr.warning("Debe ingresar un valor para comparar","¡Alto!",{
                "closeButton":true,
                "progressBar":true,
            })
            return false;
        }
        let notificar = variable["NotificarComparador"] + variable["NotificarValor"];
        temp["Notificar"] = notificar;
        temp["Nivel"] = variable["NotificarNivel"] ;
    }
    let tempJSON = JSON.parse(sessionStorage.getItem("tempVarList"));
    if(tempJSON == null){
        tempJSON = [];
    }
    if(!IsEdit){
        tempJSON.push(temp);
        toastr.success("Variable Añadida","¡Exito!",{
            "closeButton":true,
            "progressBar":true,
        })
    }else{
        let GUID = $('#AgregarVariableModaltxtGUID').val();
        let id = tempJSON.indexOf(tempJSON.filter(variable => variable["UnicID"] == GUID)[0]);
        temp["Valor"] = (tempJSON.filter(variable => variable["UnicID"] == GUID)[0])["Valor"];
        tempJSON.splice(id,1,temp);
        toastr.success("Variable Actualizada","¡Exito!",{
            "closeButton":true,
            "progressBar":true,
        })
    }
    sessionStorage.setItem("tempVarList",JSON.stringify(tempJSON));
    return true;
}

export function ActualizarVariablesList(){
    let variables = JSON.parse(sessionStorage.getItem("tempVarList"));
    $('#AgregarDispositivoModalVariables').html("");
   if(variables == null || variables.length == 0){
       $('#VariablesCount').html("Variables 0/12");
       $('#AgregarDispositivoModalVariables').append(`
            <p class="alert alert-warning text-center mt-2">No hay Variables</p>
       `);
       return;
    }
   $('#VariablesCount').html("Variables {0}/12".format(variables.length));
   variables.forEach( variable => {
    $('#AgregarDispositivoModalVariables').append(
        `<div class="border d-flex flex-row justify-content-around mt-2 w-100">
            <textarea class="my-auto content text-center font textarea" style="width:17.0%; font-size:calc(.85em + 0.15vmin)"
            readonly>{0}</textarea>
            <textarea class="my-auto content text-center font textarea" style="width:15.0%; font-size:calc(.85em + 0.15vmin)"
            readonly>{1}</textarea>
            <textarea class="my-auto content text-center font textarea" style="width:15.0%; font-size:calc(.85em + 0.15vmin)"
            readonly>{2}</textarea>
            <textarea class="my-auto content text-center font textarea" style="width:15.0%; font-size:calc(.85em + 0.15vmin)"
            readonly>{3}</textarea>
            <textarea class="my-auto content text-center font textarea" style="width:15.0%; font-size:calc(.85em + 0.15vmin)"
            readonly>{4}</textarea>
            <div class="p-2" >
                <button id="{5}" class="btn p-0 AgregarVariableModalbtnEditarVariable"><span><img class="img-fluid" src="../img/Editar-SM.png"
                            alt=""></span></button>
                <button id="{6}" class="btn p-0 AgregarVariableModalbtnEliminarVariable"><span><img class="img-fluid" src="../img/Eliminar.png"
                            alt=""></span></button>
            </div>
        </div>`.format(variable["Nombre"], variable["PIN"], variable["IsOutput"] == true ? "Escritura" : "Lectura",variable["DisplayColor"] == "" ? "-" : variable["DisplayColor"],variable["Analogic"] == true  ? "Analogica" : "Digital",variable["UnicID"],variable["UnicID"] )
    );
   });
}

export async function ValidarDispositivo(IsEdit = false,IsCopy = false){
    let temp = {
        "UnicID":GenerateGUID(),
        "Nombre":null,
        "ID":null,
        "Token":null,
        "Time":15,  
        "variables":sessionStorage.getItem("tempVarList") == null ? [] : JSON.parse(sessionStorage.getItem("tempVarList")),
        "Image":"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",
        "IsEmpty":false,
        "X":0,
        "Y":0,
        "LastUpdate":"Nunca",
    }

    let Nombre = $('#AgregarDispositivoModaltxtNombre').val();
    let ID = $('#AgregarDispositivoModaltxtID').val();
    let Token = $('#AgregarDispositivoModaltxtToken').val();
    let Tiempo = $('#AgregarDispositivoModaltxtTiempo').val();
    let Imagen = $('#AgregarDispositivoModalImagen')[0].files;
    if(Nombre == "" || IsNumeric(Nombre)){
        toastr.warning("Nombre Invalido","¡Alto!",{
            "closeButton":true,
            "progressBar":true,
        })
        return;
    }
    
    if(ID == "" || !IsNumeric(ID)){
        toastr.warning("ID Invalido","¡Alto!",{
            "closeButton":true,
            "progressBar":true,
        })
        return;
    }
    if(Token == ""){
        toastr.warning("Token Invalido","¡Alto!",{
            "closeButton":true,
            "progressBar":true,
        })
        return;
    }
    if(Tiempo == "" || !IsNumeric(Tiempo) || (Tiempo < 5 || Tiempo > 240) ){
        toastr.warning("Tiempo Invalido","¡Alto!",{
            "closeButton":true,
            "progressBar":true,
        })
        return;
    }
    temp["Nombre"] = Nombre;
    temp["ID"] = ID;
    temp["Token"] = Token;
    temp["Time"] = Tiempo;
    if(Imagen.length != 0){
        let type = Imagen[0].type;
        let result = await ImageToByteArray(Imagen);
        if(type == "image/png"){
            temp["Image"] = Imagen.substring(22);
        }else if(type == "image/jpeg"){
            temp["Image"] = Imagen.substring(23);
        }else if(type == "image/jpg"){
            temp["Image"] = Imagen.substring(22);
        }
   }else if(IsEdit || IsCopy){
        temp["Image"] = ($('#AgregarDispositivoModalPrevImagen').attr('src')).substring(18);
   }
    if(confirm("¿Seguro?")){
        let project = JSON.parse(sessionStorage.getItem("SessionProject"));
        
        if(!IsEdit || IsCopy){
            project["Drivers"].push(temp);
            toastr.success("Dispositivo Registrado","¡Exito!",{
                "closeButton":true,
                "progressBar":true,
            })
        }else{
            let GUID = $('#AgregaDispositivoModaltxtGUID').val();
            temp["UnicID"] = GUID;
            let id = project["Drivers"].indexOf(project["Drivers"].filter(dispositivo => dispositivo["UnicID"] == GUID )[0])
            temp["LastUpdate"] = (project["Drivers"].filter(d => d["UnicID"] == GUID )[0])["LastUpdate"];
            project["Drivers"].splice(id,1,temp);  
            toastr.success("Dispositivo Actualizado","¡Exito!",{
                "closeButton":true,
                "progressBar":true,
            })
        }
        sessionStorage.setItem("SessionProject",JSON.stringify(project));
        $('#AgregarDispositivoModal').modal('hide');
        let Dispositivos = JSON.parse(sessionStorage.getItem("SessionProject"));
        MostrarDispositivos(Dispositivos);
        ObtenerDispositivos();
        Guardar(project);
    }
}

export function EliminarDispositivo(GUID){
    let Dispositivos =  JSON.parse(sessionStorage.getItem("SessionProject"));
    let id =  Dispositivos["Drivers"].indexOf(Dispositivos["Drivers"].filter(dispositivo => dispositivo["UnicID"] == GUID )[0]);
    Dispositivos["Drivers"].splice(id,1);
    sessionStorage.setItem("SessionProject",JSON.stringify(Dispositivos));
    ObtenerDispositivos();
    MostrarDispositivos(Dispositivos);
    toastr.success("Dispositivo Eliminado","¡Exito!",{
        "closeButton":true,
        "progressBar":true,
    })
    Guardar(Dispositivos);

}

export function PrepareToEdit(GUID){
    let Dispositivo = JSON.parse(sessionStorage.getItem("SessionProject"))["Drivers"].filter( dispositivo => dispositivo["UnicID"] ==  GUID)[0];
    $('#AgregarDispositivolblTitle').html('Editar Dispositivo');
    $('#AgregarDispositivoModalbtnImportar').addClass('d-none');
    $('#AgregarDispositivoModalbtnAceptar').attr('id','AgregarDispositivoModalbtnEditar');
    $('#AgregarDispositivoModalbtnCopiar').attr('id','AgregarDispositivoModalbtnEditar');

    $('#AgregarDispositivoModaltxtNombre').val(Dispositivo["Nombre"]);
    $('#AgregarDispositivoModaltxtID').val(Dispositivo["ID"]);
    $('#AgregarDispositivoModaltxtToken').val(Dispositivo["Token"]);
    $('#AgregarDispositivoModaltxtTiempo').val(Dispositivo["Time"]);
    $('#AgregarDispositivoModalPrevImagen').attr('src',`data:image;base64,{0}`.format(Dispositivo["Image"]));
    
    $('#AgregaDispositivoModaltxtGUID').val(Dispositivo["UnicID"])
    sessionStorage.setItem("tempVarList",JSON.stringify(Dispositivo["variables"]));
    ActualizarVariablesList();

}

export async function PrepareToEditVar(GUID){
     let variable = JSON.parse(sessionStorage.getItem("tempVarList")).filter( variable => variable["UnicID"] == GUID )[0];
    $('#AgregarVariableModallblTitle').html("Editar Variable");
    let ID = $('#AgregarDispositivoModaltxtID').val();
    let Token = $('#AgregarDispositivoModaltxtToken').val();
    let vFunciones =  await ObtenerVariablesFunciones(ID,Token);
    ActualizarVariablesFunciones(String(variable["IsOutput"]),vFunciones);
    $('#AgregarVariableModaltxtGUID').val(variable["UnicID"]);
    $('#AgregarVariableModaltxtNombre').val(variable["Nombre"]);
    $('#AgregarVariableModalcmbSeñal').val(String(variable["Analogic"])).change();
    $('#AgregarVariableModalcmbTipo').val(String(variable["IsOutput"])).change();
    $('#AgregarVariableModalcmbVariable').val(variable["PIN"]).change();

    if(variable["DisplayColor"] != "" && variable["DisplayColor"] != null){
        $('#AgregarVariableModalcmbColor').attr('disabled',false);
        $('#AgregarVariableModalcmbColor').val(variable["DisplayColor"]);
        $('#AgregarVariableModalcmbColor').selectpicker('refresh');
    }
    if(variable["Expresion"] != "" && variable["Expresion"] != null){
        $('#AgregarVariableModaltxtExpresion').val(variable["Expresion"]);
    }
    if(variable["Notificar"] != "" && variable["Notificar"] != null){
        $('#AgregarVariableModalcheckNotificar').prop('checked',true).change();
        $('#AgregarVariableModalcmbNotificarComparador').val(variable["Notificar"].substring(0,2));
        $('#AgregarVariableModalcmbNotificarValor').val(variable["Notificar"].substring(2));
        $('#AgregarVariableModalcmbNotificarNivel').val(variable["Nivel"]);
    }else{
        $('#AgregarVariableModalcheckNotificar').prop('checked',false).change();
    }
}   

export function EliminarVariable(GUID){
    let variables = JSON.parse(sessionStorage.getItem("tempVarList"));
    let id =  variables.indexOf(variables.filter(variable => variable["UnicID"] == GUID )[0]);
    variables.splice(id,1);
    sessionStorage.setItem("tempVarList",JSON.stringify(variables));
    ActualizarVariablesList();
    toastr.success("Variable Eliminada","¡Exito!",{
        "closeButton":true,
        "progressBar":true,
    });
}

export function PrevisualizarImagen(file,dest){
    let reader =  new FileReader();

    if(file && file[0]){
        reader.onload = function (e) {
            $(dest).attr('src', e.target.result);
        }
        reader.readAsDataURL(file[0]);
    }
    
}

function ImageToByteArray(file) {
    return new Promise( resolve =>{ 
        let reader = new FileReader();
        if(file && file[0]){
            reader.onloadend = function(e) {
                resolve(reader.result);   
            }
            reader.readAsDataURL(file[0]);
        }
    }); 
}

export async function GuardarImagen(file,GUID){
    let Dispositivos = JSON.parse(sessionStorage.getItem("SessionProject"));
    let Dispositivo = Dispositivos["Drivers"].filter(dispositivo1 => dispositivo1["UnicID"] == GUID)[0];
    let type = file[0].type;
    let Imagen = await ImageToByteArray(file);
    if(type == "image/png"){
        Dispositivo["Image"] = Imagen.substring(22);
    }else if(type == "image/jpeg"){
        Dispositivo["Image"] = Imagen.substring(23);
    }else if(type == "image/jpg"){
        Dispositivo["Image"] = Imagen.substring(22);
    }
    
    let id =  Dispositivos["Drivers"].indexOf(Dispositivos["Drivers"].filter(dispositivo1 => dispositivo1["UnicID"] == GUID )[0]);
    Dispositivos["Drivers"].splice(id,1,Dispositivo);
    toastr.success("Imagen Actualiada","¡Exito!",{
        "closeButton":true,
        "progressBar":true,
    });
    sessionStorage.setItem("SessionProject",JSON.stringify(Dispositivos));
    Guardar(Dispositivos);
}

export async function ImportarProyecto(file){
    if(sessionStorage.getItem("SessionProject") == null){
        toastr.error("¡Error! Debe abrir un proyecto antes","¡Error!",{
            "closeButton":true,
            "progressBar":true
        })
        return;
    }
    let jsonarray = await FileToJsonArray(file);
    let SessionProject = JSON.parse(sessionStorage.getItem("SessionProject"));  
    if(SessionProject == null){
    toastr.error("Debe registrar un proyecto","¡Error!",{
        "closeButton":true,
        "progressBar":true
    });
   
        let proyecto =  JSON.parse(sessionStorage.getItem("SessionProject"));
        jsonarray.forEach(element => {
            element["UnicID"] = GenerateGUID();
            element["Image"] = "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";
            temp = element["variables"];
            element["variables"] = [];
            temp.forEach(v => {
                temp["UnicID"] = GenerateGUID();
                element["variables"].push(v);
            });
            proyecto["Drivers"].push(element);
        });
        sessionStorage.setItem("SessionProject",JSON.stringify(proyecto));
        MostrarDispositivos(proyecto);
        ObtenerDispositivos();
        toastr.success("Importado exitosamente","¡Exito!",{
            "closeButton":true,
            "progressBar":true
        });
        Guardar(proyecto);
            
    }else{
        let proyecto =  JSON.parse(sessionStorage.getItem("SessionProject"));
        jsonarray.forEach(element => {
            element["UnicID"] = GenerateGUID();
            element["Image"] = "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";
            proyecto["Drivers"].push(element);
        });
        sessionStorage.setItem("SessionProject",JSON.stringify(proyecto));
        MostrarDispositivos(proyecto);
        ObtenerDispositivos();
        toastr.success("Importado exitosamente","¡Exito!",{
            "closeButton":true,
            "progressBar":true
        });
        Guardar(proyecto);
    }
}

export function GenerateGUID()
{
  function hex (s, b)
  {
    return s +
      (b >>> 4   ).toString (16) +  // high nibble
      (b & 0b1111).toString (16);   // low nibble
  }

  let r = crypto.getRandomValues (new Uint8Array (16));

  r[6] = r[6] >>> 4 | 0b01000000; // Set type 4: 0100
  r[8] = r[8] >>> 3 | 0b10000000; // Set variant: 100

  return r.slice ( 0,  4).reduce (hex, '' ) +
         r.slice ( 4,  6).reduce (hex, '-') +
         r.slice ( 6,  8).reduce (hex, '-') +
         r.slice ( 8, 10).reduce (hex, '-') +
         r.slice (10, 16).reduce (hex, '-');
}

export function GenerateObjectId () {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

function FileToJsonArray(file){
    return new Promise ( resolve => {
        let reader = new FileReader();
        if(file && file[0]){
            reader.onloadend = function(e){
                resolve(JSON.parse(reader.result));
            }
            reader.readAsText(file[0]);
        }    
    });
}

function FiltroFunciones(funcion){
    return funcion["IsOutput"] == "true";
}
function FiltroVariables(variable){
    return variable["IsOutput"] == "false";
}

export function IsNumeric(string){
    return isNaN(parseInt(string)) ? false : true; 
}

export function formatDate(date) {  
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    let formatdate = "{0}-{1}-{2}".format(year,month,day);
    return formatdate;
}

String.prototype.format = function() {
    let a;
    a = this;
    for (let k in arguments) {
      a = a.replace("{" + k + "}", arguments[k])
    }
    return a
}
