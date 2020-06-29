window.settings = {
    "Host":"127.0.0.1",
    "Port":"8080"
}
ObtenerConfiguraciones();

$(document).ready(function(){
    $('#LoginForm').on("submit",function(e){
        e.preventDefault();
        IniciarSesion();
    });
    
});

function IniciarSesion() {  
    $("#Error").addClass("d-none");
    var usuario = $('#inputEmail').val();
    var password= $('#inputPassword').val();

    $.ajax({
        url: `http://${settings['Host']}:${settings['Port']}/Sesion/IniciarSesion`,
        type: 'POST',
        data:  JSON.stringify({'Usuario':usuario,'Password':password}),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () { 
            $('#btnLogin').addClass("d-none");
            $('#Status').removeClass("d-none");
        },
        success:function (answer) { 
            if(answer["Id"] == null){
                $('#Error').removeClass().addClass("alert alert-danger").html("¡Error! No se pudo iniciar sesión");
                $('#btnLogin').removeClass("d-none");
                $('#Status').addClass("d-none");
                return;
            }
            if(answer["Enabled"] ==  false && answer["Id"] != ""){
                $('#Error').removeClass().addClass("alert alert-warning").html("¡Advertencia! Usuario no tiene permitido iniciar sesión");
                $('#btnLogin').removeClass("d-none");
                $('#Status').addClass("d-none");
                return;
            }
            if(answer["Enabled"] ==  false && answer["Id"] == ""){
                $('#Error').removeClass().addClass("alert alert-warning").html("Usuario y/o contraseña incorrecto");
                $('#btnLogin').removeClass("d-none");
                $('#Status').addClass("d-none");
                return;
            }
            sessionStorage.setItem("Id",answer["Id"]);
            sessionStorage.setItem("Nombre",answer["Nombres"]);
            sessionStorage.setItem("Tipo",answer["Tipo"]);
            location.href =  "html/main.html";
        }
    }).fail(function () { 
        $('#Error').removeClass().addClass("alert alert-danger").html("¡Error! No se pudo iniciar sesión");
        $('#btnLogin').removeClass("d-none");
        $('#Status').addClass("d-none");
    });
}

function ObtenerConfiguraciones() {
    $.ajax({
        url:'setting.json',
        type:'POST',
        success:function(answer){
            window.settings = answer  
        }
    });
}