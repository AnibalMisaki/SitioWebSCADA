import { IsNumeric, GenerateObjectId } from "./dispositivos.js";

export function ObtenerUsuarios(filter) {
    $.ajax({
        url: `https://${settings['Host']}:${settings['Port']}/Sesion/ObtenerUsuarios`,
        type: 'GET',
        beforeSend: function (request) {
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            $('#UsuariosModalBody').html("");
            $('#UsuariosModalBody').append(`
                <div>
                    <img src="../img/loading.gif" id="UsuariosModalStatus" class="ml-auto mr-auto d-block">
                    <h5 class="text-muted text-center" id="UsuariosModallblStatus">Obteniendo Usuarios...</h5>
                </div> `);
        },
        success: function (answer) {
            if(answer.length == 0){
                $('#UsuariosModalStatus').attr('src','../img/Empty.png');
                $('#UsuariosModallblStatus').html("¡Nada!");
                return;
            }
            switch (filter) {
                case "All":
                    MostrarUsuarios(answer);
                    break;
                case "Administrador":
                    MostrarUsuarios( answer.filter(u => u["Tipo"] == "Administrador") )
                    break;
                case "Usuario":
                    MostrarUsuarios( answer.filter(u => u["Tipo"] == "Usuario"));
                    break;
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
        $('#UsuariosModalStatus').attr('src','../img/Error.png');
        $('#UsuariosModallblStatus').html("¡Error! Ha ocurrido un error");
    });
}

function MostrarUsuarios(usuarios) {
    $('#UsuariosCount').html("Total: {0} Usuarios".format(usuarios.length));
    if(usuarios.length == 0){
        $('#UsuariosModalStatus').attr('src','../img/Empty.png');
        $('#UsuariosModallblStatus').html("¡No hay usuarios de este tipo!");
        return;
    }
    $('#UsuariosModalBody').html("");
    $('#UsuariosModalBody').append(`
        <div class="d-flex flex-row justify-content-around mb-2 pt-2 pr-3" id="UsuariosModallbls" style="font-size:calc(.85em + 0.15vmin);">
            <span class="text-center" style="width: 25.0%;">Nombres:</span>
            <span class="text-center" style="width: 20.0%;">Usuario:</span>
            <span class="text-center" style="width: 20.0%;">Email:</span>
            <span class="text-center" style="width: 15.0%;">Tipo:</span>
            <span class="text-center UsuariosModalaccioneslbl" style="width: 20.0%;">Acciones:</span>
        </div>`);
    let currentUser = JSON.parse(sessionStorage.getItem("Session"));
    usuarios.forEach(u => {
        $('#UsuariosModalBody').append(`
        <div class="border d-flex flex-row justify-content-around mt-2 w-100 UsuariosModaltxts" id="{0}" style="height:36px;" style="font-size:calc(.85em + 0.15vmin);">
            <textarea class="my-auto text-center content font" style="resize: none; border:none; width: 20.0%;" readonly>{1}</textarea>
            <textarea class="my-auto text-center content font" style="resize: none; border:none; width: 20.0%;" readonly>{2}</textarea>
            <textarea class="my-auto text-center content font" style="resize: none; border:none; width: 20.0%;" readonly>{3}</textarea>
            <textarea class="my-auto text-center content font" style="resize: none; border:none; width: 15.0%;" readonly>{4}</textarea>
            <div class="d-flex justify-content-center acciones" style="width: 20.0%;">
            </div>
        </div>`.format(u["Id"],u["Nombres"],u["Usuario"],u["Email"] == "" ? "-" : u["Email"],u["Tipo"] ));

        let accionesDiv = $(`#${u["Id"]}`).find('.acciones');
        accionesDiv.append(
            (u["Usuario"] == "administrador.scada") || (u["Usuario"] == currentUser["Usuario"]) || (u["Tipo"] == "Administrador" && currentUser["Usuario"] != "administrador.scada" )  ? 
                            null: `<button id="{0}" class="btn p-1 {1}"><span><img  class="img-fluid" src="../img/{2}"
                            alt=""></span></button>`.format(u["Id"],u["Enabled"] == "true" ? "UsuariosModalbtnDesHabilitar" : "UsuariosModalbtnHabilitar",u["Enabled"] == "true" ? "denied.png" : "allow.png" )
           ,((u["Usuario"] == "administrador.scada") && currentUser["Usuario"] != "administrador.scada" ) || (u["Usuario"] != currentUser["Usuario"] && (u["Tipo"] == "Administrador" && currentUser["Usuario"] != "administrador.scada"  )) ?
                            null : `<button id="{0}" class="btn p-1 UsuariosModalbtnEditar"><span><img class="img-fluid" src="../img/Editar-SM.png"
                            alt=""></span></button>`.format(u["Id"]) 
           ,(u["Usuario"] == "administrador.scada") || (u["Usuario"] == currentUser["Usuario"]) || (u["Tipo"] == "Administrador" && currentUser["Usuario"] != "administrador.scada" )?
                            null:`<button id="{0}" class="btn p-1 UsuariosModalbtnEliminar"><span><img class="img-fluid" src="../img/deluser.png"
                            alt=""></span></button>`.format(u["Id"])
                
        );
    });

}

export function HabilitarUsuario(objectID){

    $.ajax({
        url:`https://${settings['Host']}:${settings['Port']}/Sesion/HabilitarUsuario/{0}`.format(objectID),
        type: 'GET',
        beforeSend:function (request) {
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            $(`#${objectID}`).find('.UsuariosModalbtnHabilitar').attr('disabled',true);
        },success:function (answer) {
            if(answer["Success"] == "true"){
                $(`#${objectID}`).find('.UsuariosModalbtnHabilitar').find('img').attr('src','../img/denied.png');
                $(`#${objectID}`).find('.UsuariosModalbtnHabilitar').attr('disabled',false);
                $(`#${objectID}`).find('.UsuariosModalbtnHabilitar').attr('class','btn p-1 UsuariosModalbtnDesHabilitar');
                toastr.success(answer["Message"],"¡Exito!",{
                    "progressBar":true,
                    "closeButton":true
                })
            }else{
                toastr.error(answer["Message"],"¡Exito!",{
                    "progressBar":true,
                    "closeButton":true
                })
            }
        }
    }).fail(function (jqXHR) { 
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
        $(`#${objectID}`).find('.UsuariosModalbtnHabilitar').attr('disabled',false);
        toastr.error("¡Error! usuario no pudo ser habilitado","¡Error!",{
            "progressBar":true,
            "closeButton":true
        })
    });
}

export function DesHabilitarUsuario(objectID){

    $.ajax({
        url:`https://${settings['Host']}:${settings['Port']}/Sesion/DeshabilitarUsuario/{0}`.format(objectID),
        type: 'GET',
        beforeSend:function (request) {
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            $(`#${objectID}`).find('.UsuariosModalbtnDesHabilitar').attr('disabled',true);
        },success:function (answer) {
            if(answer["Success"] == "true"){
                $(`#${objectID}`).find('.UsuariosModalbtnDesHabilitar').find('img').attr('src','../img/allow.png');
                $(`#${objectID}`).find('.UsuariosModalbtnDesHabilitar').attr('disabled',false);
                $(`#${objectID}`).find('.UsuariosModalbtnDesHabilitar').attr('class','btn p-1 UsuariosModalbtnHabilitar');
                toastr.success(answer["Message"],"¡Exito!",{
                    "progressBar":true,
                    "closeButton":true
                })
            }else{
                toastr.error(answer["Message"],"¡Exito!",{
                    "progressBar":true,
                    "closeButton":true
                })
            }
        }
    }).fail(function (jqXHR) { 
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
        $(`#${objectID}`).find('.UsuariosModalbtnDesHabilitar').attr('disabled',false);
        toastr.error("¡Error! usuario no pudo ser deshabilitado","¡Error!",{
            "progressBar":true,
            "closeButton":true
        });
    });

}

export function ValidarUsuario(usuario,IsEdit = false,IsAccount = false){
    let regex =  /^((\w|ñ){1,}(\.){0,1}){1,}@(\w|ñ){3,}((\.)[ñA-Za-z]{2,3}){1,}/g;
    let temp = {
        "Id":GenerateObjectId(),
        "Nombres":"",
        "Usuario":"",
        "Email":"",
        "Password":RandomPassword(),
        "Tipo":"Usuario",
        "Enabled":"false"
    }
    if(usuario["Nombres"] == "" || IsNumeric(usuario["Nombre"])){
        toastr.error("Nombre invalido","¡Error!",{
            "progressBar":true,
            "closeButton":true
        });
        return;
    }
    if(usuario["Usuario"] == "" || IsNumeric(usuario["Usuario"])){
        toastr.error("Usuario Invalido","¡Error!",{
            "progressBar":true,
            "closeButton":true
        });
        return;
    }
    if(usuario["Email"] == "" || IsNumeric(usuario["Email"]) || !regex.test(usuario["Email"]) ){
        toastr.error("Email Invalido","¡Error!",{
            "progressBar":true,
            "closeButton":true
        });
        return;
    }
    if((usuario["Tipo"] == "" || usuario["Tipo"] == undefined) && !IsAccount){
        toastr.error("Debe seleccionar un tipo","¡Error!",{
            "progressBar":true,
            "closeButton":true
        });
        return;
    }
    temp["Nombres"] = usuario["Nombres"];
    temp["Usuario"] = usuario["Usuario"];
    temp["Email"] = usuario["Email"];
    temp["Tipo"] = usuario["Tipo"];
    
    if(!IsEdit){
        RegistrarUsuario(temp);
    }else{
        temp["Id"] = $('#AgregarUsuarioModaltxtID').val();
        temp["Password"] = null;    
        ActualizarUsuario(temp,IsAccount);
    }
}

function RegistrarUsuario(usuario) {
    $.ajax({
        url:`https://${settings['Host']}:${settings['Port']}/Sesion/InsertarUsuario`,
        type:'POST',
        data:  JSON.stringify(usuario),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend:function(request){
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            $('#AgregarUsuarioModalbtnAceptar').addClass('d-none');
            $('#AgregarUsuarioModalS').removeClass('d-none');
        },success:function(answer){
            if(answer["Success"] == "true"){
                $('#AgregarUsuarioModal').modal('hide');
                toastr.success("Usuario registrado correctamente","¡Exito!",{
                    "progressBar":true,
                    "closeButton":true
                });
            }else{
                $('#AgregarUsuarioModalbtnAceptar').removeClass('d-none');
                $('#AgregarUsuarioModalS').addClass('d-none');
                toastr.error(answer["Message"],"¡Error!",{
                    "progressBar":true,
                    "closeButton":true
                });
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
        $('#AgregarUsuarioModalbtnAceptar').removeClass('d-none');
        $('#AgregarUsuarioModalS').addClass('d-none');
        toastr.error("Usuario no pudo ser registrado","¡Error!",{
            "progressBar":true,
            "closeButton":true
        });
    });
}

function ActualizarUsuario(usuario,IsAccount) {
    let url;
    if(IsAccount){
        url = `https://${settings['Host']}:${settings['Port']}/Sesion/ActualizarCuenta`
    }else{
        url = `https://${settings['Host']}:${settings['Port']}/Sesion/ActualizarUsuario`
    }
    $.ajax({
        url:url,
        type:'POST',
        data:  JSON.stringify(usuario),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend:function(request){
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            $('#AgregarUsuarioModalbtnAceptar').addClass('d-none');
            $('#AgregarUsuarioModalS').removeClass('d-none');
        },success:function(answer){
            if(answer["Success"] == "true"){
                $('#AgregarUsuarioModalbtnAceptar').removeClass('d-none');
                $('#AgregarUsuarioModalS').addClass('d-none');
                $('#AgregarUsuarioModal').modal('hide');
                toastr.success("Usuario actualizado correctamente","¡Exito!",{
                    "progressBar":true,
                    "closeButton":true
                });
            }else{
                $('#AgregarUsuarioModalbtnAceptar').removeClass('d-none');
                $('#AgregarUsuarioModalS').addClass('d-none');
                toastr.error(answer["Message"],"¡Error!",{
                    "progressBar":true,
                    "closeButton":true
                });
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
        $('#AgregarUsuarioModalbtnAceptar').removeClass('d-none');
        $('#AgregarUsuarioModalS').addClass('d-none');
        toastr.error("Usuario no pudo ser actualizado","¡Error!",{
            "progressBar":true,
            "closeButton":true
        });
    });
}

export function EditarUsuario(objectID){
    $('#AgregarUsuarioModal').modal({show:true,backdrop:false});
    $.ajax({
        url:`https://${settings['Host']}:${settings['Port']}/Sesion/ObtenerUsuario/{0}`.format(objectID),
        type:'GET',
        beforeSend:function (request) {
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            $('#AgregarUsuarioModalFormDiv').addClass('d-none');
            $('#AgregarUsuarioModalStatusDiv').removeClass('d-none');
            $('#AgregarUsuarioModallblTitle').html('Editar Usuario');
        },
        success:function (answer) {  
            if(answer[0]["Id"] == "" || answer[0]["Id"] == null){
                $('#AgregarUsuarioModalStatus').attr('src','../img/Error.png');
                $('#AgregarUsuarioModallblStatus').html("¡Error!");
                return;
            }else{
                $('#AgregarUsuarioModalFormDiv').removeClass('d-none');
                $('#AgregarUsuarioModalStatusDiv').addClass('d-none');
                $('#AgregarUsuarioModaltxtID').val(answer[0]["Id"]);
                $('#AgregarUsuarioModaltxtNombres').val(answer[0]["Nombres"]);
                $('#AgregarUsuarioModaltxtUsuario').val(answer[0]["Usuario"]);
                $('#AgregarUsuarioModaltxtEmail').val(answer[0]["Email"]);
                $('#AgregarUsuarioModalcmbTipo').val(answer[0]["Tipo"]);
                if(answer[0]["Usuario"] == "administrador.scada"){
                    $('#AgregarUsuarioModaltxtNombres').attr('readonly',true);
                    $('#AgregarUsuarioModaltxtUsuario').attr('readonly',true);
                    $('#AgregarUsuarioModalcmbTipo').attr('readonly',true);
                }else{
                    $('#AgregarUsuarioModaltxtNombres').attr('readonly',false);
                    $('#AgregarUsuarioModaltxtUsuario').attr('readonly',false);
                    $('#AgregarUsuarioModalcmbTipo').attr('readonly',false);
                }
                if((JSON.parse(sessionStorage.getItem("Session")))["Usuario"] != "administrador.scada" ){
                    $('#AgregarUsuarioModalcmbTipo').attr('readonly',true);
                }else{$('#AgregarUsuarioModalcmbTipo').attr('readonly',false);}
            }
        }
    }).fail(function (jqXHR) {  
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
        $('#AgregarUsuarioModalStatus').attr('src','../img/Error.png');
        $('#AgregarUsuarioModallblStatus').html("¡Error!");
    });
}

export function ObtenerCuenta() {
    return new Promise((resolve,reject) =>{
        $.ajax({
            url:`https://${settings['Host']}:${settings['Port']}/Sesion/ObtenerCuenta`,
            type:'GET',
            beforeSend:function (request) {
                let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
                request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            },
            success:function (answer) {  
                resolve(answer)
            }
        }).fail(function (jqXHR) {  
            let statusCode = jqXHR.status;
            if(statusCode == 401){
                alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
                sessionStorage.removeItem("Session");
                sessionStorage.removeItem("SessionProject");
                setTimeout(
                    location.href ="../index.html"
                    ,1000)
            }
            reject()
        });
    });
}

export function EliminarUsuario(objectID) {
    $.ajax({
        url:`https://${settings['Host']}:${settings['Port']}/Sesion/EliminarUsuario/{0}`.format(objectID),
        type:'GET',
        beforeSend:function (request) {
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            $(`#${objectID}`).find('.UsuariosModalbtnEliminar').attr('disabled',true);
        },
        success:function (answer) {
            if(answer["Success"] == "true"){
                toastr.success("Usuario eliminado con exito","¡Exito!",{
                    "progressBar":true,
                    "closeButton":true
                })
                ObtenerUsuarios($('#UsuariosModalcmbFilter').val());
            }else{
                toastr.error("¡Error! usuario no pudo ser eliminado","¡Error!",{
                    "progressBar":true,
                    "closeButton":true
                })
                $(`#${objectID}`).find('.UsuariosModalbtnEliminar').attr('disabled',false);
            }
        }

    }).fail(function (jqXHR) {
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
        $(`#${objectID}`).find('.UsuariosModalbtnEliminar').attr('disabled',false);
        toastr.error("¡Error! usuario no pudo ser eliminado","¡Error!",{
            "progressBar":true,
            "closeButton":true
        })
    });

}

export function ActualizarContraseña(password) {
    if(password["old"] == "" || password["new1"] == "" || password["new2"] == ""){
        toastr.error("Complete todos los campos","¡Error!",{
            "progressBar":true,
            "closeButton":true
        })
        return;
    }
    if(password["new1"] != password["new2"]){
        toastr.error("Constraseñas no coindicen","¡Error!",{
            "progressBar":true,
            "closeButton":true
        })
        return;
    }
    if(password["old"] == password["new1"]){
        toastr.error("Nueva contraseña no puede ser igual a la anterior","¡Error!",{
            "progressBar":true,
            "closeButton":true
        })
        return;
    }
   
    let data = {
        "Id":password["Id"],
        "OldPassword":password["old"],
        "Password":password["new1"]
    }
    
    $.ajax({
        url:`https://${settings['Host']}:${settings['Port']}/Sesion/CambiarContrasenia`,
        type:'POST',
        data:JSON.stringify(data),
        dataType:'json',
        contentType:'application/json',
        beforeSend:function (request) {  
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            $('#CambiarContraseniaModalbtnAceptar').addClass('d-none');
            $('#CambiarContraseniaModalS').removeClass('d-none');
        },
        success:function (answer) {  
            if(answer["Success"] == "false"){
                $('#CambiarContraseniaModalbtnAceptar').removeClass('d-none');
                $('#CambiarContraseniaModalS').addClass('d-none');
                toastr.error(answer["Message"],"¡Error!",{
                    "progressBar":true,
                    "closeButton":true
                })
                return;
            }else{
                toastr.success(answer["Message"],"¡Exito!",{
                    "progressBar":true,
                    "closeButton":true
                });
                $('#CambiarContraseniaModal').modal('hide');
            }
        }

    }).fail(function (jqXHR) { 
        let statusCode = jqXHR.status;
        if(statusCode == 401){
            alert("¡Error! Sesión Invalida\nReiniciando Aplicación");
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        } 
        $('#CambiarContraseniaModalbtnAceptar').removeClass('d-none');
        $('#CambiarContraseniaModalS').addClass('d-none');
        toastr.error("Ha ocurrido un error","¡Error!",{
            "progressBar":true,
            "closeButton":true
        })
        return;
    });
}

export function ValidatePrivileges(Notify){
    return new Promise((resolve,reject) => {
        if(Notify){
            toastr.info("¡Validando Privilegios!","¡Información!",{
                progressBar:true,
                closeButton:true
            })
        }
        let UserId = (JSON.parse(sessionStorage.getItem("Session")))["Id"];
        $.ajax({
            url:`https://${settings['Host']}:${settings['Port']}/Sesion/Mobile/ValidatePrivileges`,
            type:'GET',
            beforeSend:function(request){
                let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
                request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
            },success:function(response_){
                if(response_["Success"] == "true"){
                    resolve(true);
                }else{
                    reject()
                }
            }
        }).fail(function(jqXHR){
            let statusCode = jqXHR.status;
            if(statusCode == 401){
                alert("¡Error! Acceso no autorizado\nReiniciando Aplicación");
                sessionStorage.removeItem("Session");
                sessionStorage.removeItem("SessionProject");
                setTimeout(
                    location.href ="../index.html"
                    ,1000)
            }
            reject();
        });

    });
}

function RandomPassword(lenght = 12) { 

    let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let result = new String();
    
    for(let i = 0;i<lenght;i++){
        let index = Math.floor(Math.random() * alphabet.length);
        result += alphabet[index];
    }
    return result;
}
