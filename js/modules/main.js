import * as dispositivos_module from './dispositivos.js';
import * as usuarios_module from './usuarios.js';
import * as reportes_module from './reportes.js';

window.settings = {
    "Host":"127.0.0.1",
    "Port":"8080"
}

const colors = ["aqua","aquamarine","beige","black","blue","blueviolet","brown","burlywood","chartreuse","cadetblue","chocolate","crimson","cyan","darkblue","fuchsia","gold","gray","green","greenyellow","hotpink","indigo","lime","magenta","navy","olive","orange","orangered","orchid","palegreen","purple","red","salmon","silver","skyblue","slateblue","springgreen","tomato","turquoise","violet","wheat","yellow","yellowgreen"];

var start = moment().subtract(29, 'days');
var end = moment().add(1,'days');

ObtenerConfiguraciones();
$(document).ready(function(){

    if(sessionStorage.getItem("Session") == null){
        alert("¡Error! Acceso denegado");
        setTimeout(
            location.href ="../index.html"
            ,1000)
    }
    if(sessionStorage.getItem("SessionProject") != null){
        let Proyecto = JSON.parse(sessionStorage.getItem("SessionProject")) 
        dispositivos_module.AbrirProyecto(Proyecto["Id"]);  
    }else{
        $('#WorkSpaceStatus').attr('src','../img/Empty.png');
        $('#WorkSpacelblStatus').html('¡Vacio!');
    }
    //Evitar Padding al cerrar un modal
    $('body').on('show.bs.modal', function () {
        $('.modal').css('margin-right', '0px');
    });
    //Cerrar session
    $('#MenubtnCerrarSession').on('click',function () {
        if(confirm("¿Cerrar Sesión?")){
            sessionStorage.removeItem("Session");
            sessionStorage.removeItem("SessionProject");
            setTimeout(
                location.href ="../index.html"
                ,1000)
        }
    });
    //Nuevo Proyecto
    $('#MenubtnAgregarProyectoModal').on('click',function (e) {  
        usuarios_module.ValidatePrivileges(true).then(()=>{
            $('#AgregarProyectoModaltxtNombre').data('SaveAs',false);
            $('#AgregarProyectoModalbtnAceptar').attr('disabled',false);
            $('#AgregarProyectoModal').modal('show');
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });   
      
    });
    //show.bs.modal
    $('#AgregarProyectoModal').on('show.bs.modal',function (e) {  
        usuarios_module.ValidatePrivileges().then(()=>{
            $('#AgregarProyectoModalbtnAceptar').attr('disabled',false);
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#AgregarProyectoModal').modal('hide');
        });   
    });

    //Guardar Proyecto
    $('#MenubtnGuardarProyecto').on('click',function(){
        usuarios_module.ValidatePrivileges(true).then(()=>{
            if(sessionStorage.getItem("SessionProject") == null){
                toastr.error("¡Error! Debe abrir un proyecto antes","¡Error!",{
                    "closeButton":true,
                    "progressBar":true
                })
                return;
            }
            if(confirm("¿Seguro que desea sobreescribir?")){
                dispositivos_module.Guardar(JSON.parse(sessionStorage.getItem("SessionProject")),true );
            }
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });   
    });
    //Guardar Como
    $('#MenubtnGuardarComoProyecto').on('click',function(){
        usuarios_module.ValidatePrivileges(true).then(()=>{
            if(sessionStorage.getItem("SessionProject") == null){
                toastr.error("¡Error! Debe abrir un proyecto antes","¡Error!",{
                    "closeButton":true,
                    "progressBar":true
                })
                return;
            }
            $('#AgregarProyectoModaltxtNombre').data('SaveAs',true);
            $('#AgregarProyectoModal').modal('show');
            $('#AgregarProyectoModalbtnAceptar').attr('disabled',false);
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });   
       
    });
    //Cambio Analogico
    $('#WorkSpace').on('focusin','.vEscrituraA',function(){
        $(this).data('prev_val',$(this).val());
    });
    $('#WorkSpace').on('change','.vEscrituraA',function() { 
        let PreviousValue = $(this).data('prev_val');
        let ParentGUID = ($(this).parents('.driver')[0]).id;
        let GUID = this.id;
        let driver = (JSON.parse(sessionStorage.getItem("SessionProject"))["Drivers"]).filter(d => d["UnicID"] == ParentGUID)[0];
        let variable = driver["variables"].filter(v => v["UnicID"] == GUID)[0];
        if(parseInt($(this).val()) < 0 || parseInt($(this).val()) > 255){
            toastr.error("Valor no puede ser inferior a 0 o superior a 255","¡Error!",{
                "progressBar":true,
                "closeButton":true
            });
            return;
        }
        variable["Valor"] = $(this).val();
        dispositivos_module.ActualizarVariable(driver["UnicID"],driver["ID"],driver["Token"],variable,PreviousValue);
        
    });
    //Toogle Digital
    $('#WorkSpace').on('click','.vEscrituraD',function(e){
        let ParentGUID = ($(this).parents('.driver')[0]).id;
        let GUID = this.id;
        let driver = (JSON.parse(sessionStorage.getItem("SessionProject"))["Drivers"]).filter(d => d["UnicID"] == ParentGUID)[0];
        let variable = driver["variables"].filter(v => v["UnicID"] == GUID)[0];
        let text = $(this).text();
        let PreviousValue = variable["Valor"];
        if(text == "Off"){variable["Valor"] = 1;}else{variable["Valor"] = 0;}
        dispositivos_module.ActualizarVariable(driver["UnicID"],driver["ID"],driver["Token"],variable,PreviousValue);
    });
    $('#WorkSpace').on('click','.vEscrituraD',function(e){
        let ParentGUID = ($(this).parents('.driver')[0]).id;
        let GUID = this.id;
        let driver = (JSON.parse(sessionStorage.getItem("SessionProject"))["Drivers"]).filter(d => d["UnicID"] == ParentGUID)[0];
        let variable = driver["variables"].filter(v => v["UnicID"] == GUID)[0];
        let text = $(this).text();
        let PreviousValue = variable["Valor"];
        if(text == "Off"){variable["Valor"] = 1;}else{variable["Valor"] = 0;}
        dispositivos_module.ActualizarVariable(driver["UnicID"],driver["ID"],driver["Token"],variable,PreviousValue);
    });
    //Cambiar Imagen
    $('#WorkSpace').on('click','.DriverPrevImage',function(e){
        $(e.target.nextElementSibling).click();
    });
    //Previsualizar cambio
    $('#WorkSpace').on('change','.DriverInputImage',function(e){
        console.log();
        let _valid = ['image/jpeg','image/png','image/jpg']
        if(ValidateSingleInput(e.target.files[0],_valid ) == true){
            dispositivos_module.PrevisualizarImagen(e.target.files,"#{0} img.DriverPrevImage".format(e.target.previousElementSibling.id));
            dispositivos_module.GuardarImagen(e.target.files,e.target.previousElementSibling.id);
            $(this).val("");
        }else{
            toastr.error("¡Error! Tipo de archivo no admitido\n<b>Tipos Admitidos: *.jpg*,*.png*<b>","¡Error!",{
                closeButton:true,
                progressBar:true
            });
            $(this).val("");
        } 
       
     });
    //Abrir Modal
    $('#AbrirModal').on('show.bs.modal',function () {
        $('#AbrirModalBody').html("");
        $('#AbrirModalBody').append(` 
            <img src="../img/loading.gif" id="ModalAbrirStatus" class="ml-auto mr-auto d-block">
            <h5 class="text-muted text-center" id="ModalAbrirlblStatus">Cargando...</h5>`);    
       dispositivos_module.ObtenerProyectosToOpen();
    });
    //btnAbrir
    $('#AbrirModal').on('click','.btnAbrir',function (e) {
        $('#AbrirModal').modal('hide');
            dispositivos_module.AbrirProyecto(this.id)
        if(confirm('¿Seguro que desea abrir este proyecto?')){
            $('#AbrirModal').modal('hide');
            dispositivos_module.AbrirProyecto(this.id);
        }
    });
    $('#MenubtnEliminar').on('click',function(e){
        usuarios_module.ValidatePrivileges(true).then(()=>{
         $('#EliminarModal').modal('show');
        }).catch(error => {  
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n\"Acceso Denegado\"","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        }); 
    });
    //Eliminar Modal
    $('#EliminarModal').on('show.bs.modal',function (e) { 
        $('#EliminarModalBody').html("");
        $('#EliminarModalBody').append(` 
            <img src="../img/loading.gif" id="ModalEliminarStatus" class="ml-auto mr-auto d-block">
            <h5 class="text-muted text-center" id="ModalEliminarlblStatus">Cargando...</h5>`);
        
        usuarios_module.ValidatePrivileges().then(()=>{
            dispositivos_module.ObtenerProyectosToDelete();
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#ModalEliminarStatus').attr('src','../img/Deny.png');
            $('#ModalEliminarlblStatus').html("¡Acesso Denegado!");
        });   
        
    });
    //btnElminar
    $('#EliminarModal').on('click','.btnEliminar',function(){
        usuarios_module.ValidatePrivileges().then(()=>{
            if(confirm("¿Seguro que desea eliminar este proyecto? Esta accion no puede deshacerse")){
                dispositivos_module.EliminarProyecto(this.id);
            }
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });   
        
    });
    $('#MenubtnDispositivos').on('click',function(e){
        usuarios_module.ValidatePrivileges(true).then(()=>{
            if(sessionStorage.getItem("SessionProject") == null){
                toastr.error("¡Error! Debe abrir un proyecto antes","¡Error!",{
                    "closeButton":true,
                    "progressBar":true
                })
                return;
            }
            $('#DispositivosModalbtnImportar').attr('disabled',false);
            $('#DispositivosModalbtnAgregar').attr('disabled',false);
            $('#DispositivosModal').modal('show');  
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });  
       
    });

    //Dispositivos Modal
    $('#DispositivosModal').on('show.bs.modal',function(){
        $('#DispositivosModalBody').html("");
        $('#DispositivosModalBody').append(`
            <img src="../img/loading.gif" id="ModalDispositivosStatus" class="ml-auto mr-auto d-block" >
            <h5 class="text-muted text-center" id="ModalDispositivoslblStatus">Obteniendo Dispositivos...</h5>
        `);
        usuarios_module.ValidatePrivileges().then(()=>{
            if(sessionStorage.getItem("SessionProject") == null){
                toastr.error("¡Error! Debe abrir un proyecto antes","¡Error!",{
                    "closeButton":true,
                    "progressBar":true
                })
                $('#DispositivosModal').modal('hide');
                return;
            }
            dispositivos_module.ObtenerDispositivos(sessionStorage.getItem("SessionProject")); 
            $('#DispositivosModalbtnImportar').attr('disabled',false);
            $('#DispositivosModalbtnAgregar').attr('disabled',false);
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#ModalDispositivosStatus').attr('src','../img/Deny.png');
            $('#ModalDispositivoslblStatus').html("¡Acceso Denegado!");
        });  
        
    });

    //show.bs.modal
    $('#AgregarDispositivoModal').on('show.bs.modal',function(){
        $('#AgregarDispositivoModaltxtNombre').val('');
        $('#AgregarDispositivoModaltxtID').val('');
        $('#AgregarDispositivoModaltxtToken').val('');
        $('#AgregarDispositivoModaltxtTiempo').val('15');
        $('#AgregarDispositivoModalPrevImagen').attr('src','../img/NoImage.png');
        dispositivos_module.ActualizarVariablesList();  
    });
    //btnImportar
    $('#DispositivosModalbtnImportar').on('click',function (e) {
        usuarios_module.ValidatePrivileges().then(()=>{
            $('#DispositivosModalInputImportar').click();  
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });   
       
    });
    $('#DispositivosModalInputImportar').on('change',function (e) {
        let _valid = ['application/json']
        if(ValidateSingleInput(this.files[0],_valid )){
            dispositivos_module.ImportarProyecto(this.files);
        }else{
            toastr.error("¡Error! Tipo de archivo no admitido\n<b>Tipos Admitidos: *.json*<b>","¡Error!",{
                closeButton:true,
                progressBar:true
            });
        }   
    });
    //btnAgregar
    $('#DispositivosModalbtnAgregar').on('click',function (e) { 
        usuarios_module.ValidatePrivileges().then(()=>{
            sessionStorage.removeItem("tempVarList");
            $('#AgregarDispositivoModal').modal({show:true,backdrop:false});
            $('#AgregarDispositivolblTitle').html("Agregar Dispositivo");   
            $('#AgregarDispositivoModalbtnImportar').removeClass('d-none');
            $('#AgregarDispositivoModalbtnEditar').attr('id','AgregarDispositivoModalbtnAceptar');
            $('#AgregarDispositivoModalbtnCopiar').attr('id','AgregarDispositivoModalbtnAceptar');
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        }); 

    });
    $('#AgregarDispositivoModalbtnImportar').on('click',function () {
        usuarios_module.ValidatePrivileges(true).then(()=>{
            $('#ImportarDispositivoModal').modal({show:true,backdrop:false});
        }).catch(error => {
            console.log(error);
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });   
        
    });
    //btnImportar
    $('#ImportarDispositivoModal').on('show.bs.modal',function(){
        usuarios_module.ValidatePrivileges().then(()=>{
            dispositivos_module.ObtenerProyectosToImport();
        }).catch(error => {
            console.log(error);
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#ImportarDispositivoModal').modal('hide');
        }); 
        
    });
    $('#ImportarDispositivoModalcmbProyecto').on('change',function(e){
        usuarios_module.ValidatePrivileges().then(()=>{
            dispositivos_module.MostrarDispositivosToImport(this.value);
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        }); 
        
    });

    $('#ImportarDispositivoModalBody').on('click','.ImportarDispositivoModalbtnImportar',function(){
        usuarios_module.ValidatePrivileges().then(()=>{
            if(confirm("¿Importar este dispositivo?")){
                dispositivos_module.ImportarDispositivo(this.id);
                $('#ImportarDispositivoModal').modal('hide');
            }
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        }); 
        
    });
    //btnEditar
    $('#DispositivosModal').on('click','.DispositivosModalbtnEditar', function(e){
        usuarios_module.ValidatePrivileges().then(()=>{
            if(confirm("¿Seguro que desea editar este dispositivo?")){
                $('#AgregarDispositivoModal').modal('show');
                dispositivos_module.PrepareToEdit(this.id); 
            }
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        }); 
    });
    //btnEliminar
    $('#DispositivosModal').on('click','.DispositivosModalbtnEliminar',function(e){
        usuarios_module.ValidatePrivileges().then(()=>{
            if(confirm("¿Seguro que desea eliminar este dispositivo?")){
                dispositivos_module.EliminarDispositivo(this.id);
             }
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        }); 
        
    });

    //btnCopiar
    $('#DispositivosModal').on('click','.DispositivosModalbtnCopiar',function(e){
        if(confirm("¿Seguro que desea copiar este dispositivo?")){
            $('#AgregarDispositivoModal').show('');
            let Dispositivo = JSON.parse(sessionStorage.getItem('SessionProject'))["Drivers"].filter(dispositivo => dispositivo["UnicID"] == this.id)[0];
            sessionStorage.removeItem("tempVarList");
            $('#AgregarDispositivoModal').modal('show');
            $('#AgregarDispositivolblTitle').html("Copiar Dispositivo");
            $('#AgregarDispositivoModalbtnImportar').removeClass('d-none');
            $('#AgregarDispositivoModalbtnEditar').attr('id','AgregarDispositivoModalbtnCopiar');
            $('#AgregarDispositivoModalbtnAceptar').attr('id','AgregarDispositivoModalbtnCopiar');
            $('#AgregarDispositivoModalbtnImportar').addClass('d-none');
            $('#AgregarDispositivoModaltxtNombre').val("{0}-Copia".format(Dispositivo["Nombre"]));
            $('#AgregarDispositivoModaltxtID').val(Dispositivo["ID"]);
            $('#AgregarDispositivoModaltxtToken').val(Dispositivo["Token"]);
            $('#AgregarDispositivoModaltxtTiempo').val(parseInt(Dispositivo["Time"]));
            $('#AgregarDispositivoModalPrevImagen').attr('src',`data:image;base64,{0}`.format(Dispositivo["Image"]));
        
    }
    });
    //Agregar Variable Modal
    $('#AgregarDispositivoModalbtnAgregarV').on('click', async function(e){
        let variables = JSON.parse(sessionStorage.getItem("tempVarList"));
        if(variables != null && variables.length >= 12){
            toastr.error("No puede agregar mas variables","¡Error!",{
                "closeButton":true,
                "progressBar":true,
            })
            return;
        }
        $('#AgregarVariableModalForm')[0].reset();
        let ID = $('#AgregarDispositivoModaltxtID').val();
        let Token = $('#AgregarDispositivoModaltxtToken').val();
        if(ID == "" || Token == ""){
            toastr.error("Ingrese ID y Token para continuar","¡Error!",{
                "closeButton":true,
                "progressBar":true,
            })
            return;
        }
        $('#AgregarVariableModal').modal({show:true,backdrop:false});
        $('#AgregarVariableModalbtnEditar').attr('id','AgregarVariableModalbtnAceptar');
        let vFunciones = await dispositivos_module.ObtenerVariablesFunciones(ID,Token);
        dispositivos_module.ActualizarVariablesFunciones("false",vFunciones);
    });
    //show.bs.modal
    $('#AgregarVariableModal').on('show.bs.modal',function(e){
        $('#AgregarVariableModalForm').trigger('reset');
        let variables = JSON.parse(sessionStorage.getItem("tempVarList"));
        if(variables != null && variables.length >= 12){
            toastr.error("No puede agregar mas variables","¡Error!",{
                "closeButton":true,
                "progressBar":true,
            })
            $('#AgregarVariableModalForm').modal('hide');
            return;
        }
        colors.forEach( color => {
            $('#AgregarVariableModalcmbColor').append(
                `<option value="{0}" data-content="<i class='fa fa-circle' style='color:{1};'></i> {2}"></option>`.format(color,new RGBColor(color).toHex(),color)
            );
        }); 
        $('#AgregarVariableModalcmbColor').selectpicker('refresh');
    });
    //Editar Variable
    $('#AgregarDispositivoModal').on('click','.AgregarVariableModalbtnEditarVariable',function(e){
        if(confirm("¿Editar esta variable?")){
            $('#AgregarVariableModalbtnAceptar').attr('id','AgregarVariableModalbtnEditar');
            $('#AgregarVariableModal').modal({show:true,backdrop:false});
            dispositivos_module.PrepareToEditVar(this.id);
        }
    });
    //Eliminar Variable
    $('#AgregarDispositivoModal').on('click','.AgregarVariableModalbtnEliminarVariable',function(e){
        if(confirm("¿Eliminar esta variable?")){
            dispositivos_module.EliminarVariable(this.id);
        }
    });

    //Cambiar Imagen
    $('#AgregarDispositivoModalPrevImagen').on('click',function(e){
        $('#AgregarDispositivoModalImagen').click();
    });
    //Previsualizar Imagen
    $('#AgregarDispositivoModalImagen').on('change',function(e){
       dispositivos_module.PrevisualizarImagen(e.target.files,"#AgregarDispositivoModalPrevImagen");
    });
    //Submit Añadir
    $('#AgregarDispositivoModal').on('click','#AgregarDispositivoModalbtnAceptar',function (e){
       dispositivos_module.ValidarDispositivo(); 
    });
    //Submit Editar
    $('#AgregarDispositivoModal').on('click','#AgregarDispositivoModalbtnEditar',function (e){
        dispositivos_module.ValidarDispositivo(true); 
     });
     //Submit Copiar
     $('#AgregarDispositivoModal').on('click','#AgregarDispositivoModalbtnCopiar',function(e){
        dispositivos_module.ValidarDispositivo(false,true);
    });
    //Cambio Tipo
    $('#AgregarVariableModalcmbTipo').on('change',function (e) { 
        let output = e.target.value == "true" ? true : false; //boolean got string
        let analogic = $('#AgregarVariableModalcmbSeñal').val()  == "true" ? true : false;
        if(output){
             $('#AgregarVariableModalcheckNotificar').attr('disabled',true);
             $('#AgregarVariableModalcheckNotificar').prop('checked',false).change();
             $('#AgregarVariableModaltxtExpresion').attr('disabled',true);
        }else{
            $('#AgregarVariableModalcheckNotificar').attr('disabled',false);
            $('#AgregarVariableModalcheckNotificar').prop('checked',false).change();
            $('#AgregarVariableModaltxtExpresion').attr('disabled',false);
        }
        if(!analogic && !output){
            $('#AgregarVariableModalcmbColor').attr('disabled',false);
            $('#AgregarVariableModalcmbColor').selectpicker('refresh');
        }else if(analogic && !output){
            $('#AgregarVariableModalcmbColor').attr('disabled',true);
            $('#AgregarVariableModalcmbColor').selectpicker('refresh');
        }
        dispositivos_module.ActualizarVariablesFunciones(e.target.value);
    })
    //Cambio Señal
    $('#AgregarVariableModalcmbSeñal').on('change',function (e) { 
        let analogic = e.target.value == "true" ? true : false; //boolean got string
        let output = $('#AgregarVariableModalcmbTipo').val()  == "true" ? true : false;
        if(!analogic && !output){
            $('#AgregarVariableModalcmbColor').attr('disabled',false);
            $('#AgregarVariableModaltxtExpresion').attr('disabled',true);
            $('#AgregarVariableModalcmbColor').selectpicker('refresh');
        }else if(analogic && !output    ){
            $('#AgregarVariableModalcmbColor').attr('disabled',true);
            $('#AgregarVariableModaltxtExpresion').attr('disabled',false);
            $('#AgregarVariableModalcmbColor').selectpicker('refresh');
        }
    })
    //Cambio Notificar
    $('#AgregarVariableModalcheckNotificar').on('change',function(){
        
        if( $(this).is(':checked')){
            $('#AgregarVariableModalcmbNotificarComparador').attr('disabled',false);
            $('#AgregarVariableModalcmbNotificarValor').attr('disabled',false);
            $('#AgregarVariableModalcmbNotificarNivel').attr('disabled',false);
            $('#AgregarVariableModalcmbNotificarNivel').selectpicker('refresh');
        }else{
            $('#AgregarVariableModalcmbNotificarComparador').attr('disabled',true);
            $('#AgregarVariableModalcmbNotificarValor').attr('disabled',true);
            $('#AgregarVariableModalcmbNotificarNivel').attr('disabled',true);
            $('#AgregarVariableModalcmbNotificarNivel').selectpicker('refresh');
        }
    });

    //Evento Submit
    $('#AgregarVariableModalForm').on('submit',function (e) {
        e.preventDefault();
        let IsEdit = $(document.activeElement)[0].id == "AgregarVariableModalbtnEditar" ? true : false;
        let data = getFormData($(this));
        if(dispositivos_module.ValidarVariable(data,IsEdit)){
            $('#AgregarVariableModal').modal('hide');
        }
    })
    //Actualizar Variables
    $('#AgregarVariableModal').on('hidden.bs.modal',function(e){
        dispositivos_module.ActualizarVariablesList();
    });
    //Remover projecto
    $('#MenubtnCerrar').on('click',function () { 
        if(confirm("¿Seguro?")){
            sessionStorage.removeItem("SessionProject");
            setTimeout(document.location.reload(),1000);
        }
    });


    // Usuarios

    $('#MenubtnUsuarios').on('click',function(){
        usuarios_module.ValidatePrivileges(true).then(()=>{
            $('#UsuariosModal').modal('show');
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });

    });

    $('#UsuariosModal').on('show.bs.modal',function () { 
        $('#UsuariosModalBody').html("");
        $('#UsuariosModalBody').append(`<img src="../img/loading.gif" id="UsuariosModalStatus" class="ml-auto mr-auto d-block">
                                        <h5 class="text-muted text-center" id="UsuariosModallblStatus">Obteniendo Usuarios...</h5>`);
        usuarios_module.ValidatePrivileges().then(()=>{
            usuarios_module.ObtenerUsuarios($('#UsuariosModalcmbFilter').val());
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#UsuariosModalStatus').attr('src','../img/Deny.png');
            $('#UsuariosModallblStatus').html("¡Acceso Denegado!");
        }); 
        
    });

    $('#UsuariosModalcmbFilter').on('change',function () {
        usuarios_module.ValidatePrivileges().then(()=>{
            usuarios_module.ObtenerUsuarios($('#UsuariosModalcmbFilter').val());
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#UsuariosModalBody').html("");
            $('#UsuariosModalBody').append(`<img src="../img/Deny.png" id="UsuariosModalStatus" class="ml-auto mr-auto d-block">
                                        <h5 class="text-muted text-center" id="UsuariosModallblStatus">¡Acceso Denegado!</h5>`);
        }); 
    });

    $('#UsuariosModal').on('click','.UsuariosModalbtnDesHabilitar',function () {
        usuarios_module.ValidatePrivileges().then(()=>{
            if(confirm("¿Seguro que desea deshabilitar este usuario?")){
                usuarios_module.DesHabilitarUsuario(this.id);
            }
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#UsuariosModalBody').html("");
            $('#UsuariosModalBody').append(`<img src="../img/Deny.png" id="UsuariosModalStatus" class="ml-auto mr-auto d-block">
                                        <h5 class="text-muted text-center" id="UsuariosModallblStatus">¡Acceso Denegado!</h5>`);
        });  
        
    });

    $('#UsuariosModal').on('click','.UsuariosModalbtnHabilitar',function () { 
        usuarios_module.ValidatePrivileges().then(()=>{
            if(confirm("¿Seguro que desea habilitar este usuario?")){
                usuarios_module.HabilitarUsuario(this.id);
            }
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#UsuariosModalBody').html("");
            $('#UsuariosModalBody').append(`<img src="../img/Deny.png" id="UsuariosModalStatus" class="ml-auto mr-auto d-block">
                                        <h5 class="text-muted text-center" id="UsuariosModallblStatus">¡Acceso Denegado!</h5>`);
        }); 
        
    });

    //Agregar Usuarios Modal

    $('#UsuariosModalbtnAgregar').on('click',function () {
        usuarios_module.ValidatePrivileges(true).then(()=>{
            $('#AgregarUsuarioModallblTitle').html('Agregar Usuario');
            $('#AgregarUsuarioModal').modal({show:true,backdrop:false});
            $('#AgregarUsuarioModalbtnEditar').attr('id','AgregarUsuarioModalbtnAceptar');
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        }); 
    });

    //show.bs.modal
    $('#AgregarUsuarioModal').on('show.bs.modal',function () { 
        usuarios_module.ValidatePrivileges().then(()=>{
            $('#AgregarUsuarioModalS').addClass('d-none');
            $('#AgregarUsuarioModalForm').trigger('reset');
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#AgregarUsuarioModal').modal('hide');
        }); 
       
    });

    //hide.bs.modal
    $('#AgregarUsuarioModal').on('hide.bs.modal',function () { 
        usuarios_module.ValidatePrivileges().then(()=>{
            usuarios_module.ObtenerUsuarios($('#UsuariosModalcmbFilter').val());
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        }); 
    });
    //Editar
    $('#UsuariosModal').on('click','.UsuariosModalbtnEditar',function () {  
        usuarios_module.ValidatePrivileges().then(()=>{
            if(confirm("¿Seguro que desea editar este usuario?")){
                $('#AgregarUsuarioModalbtnAceptar').attr('id','AgregarUsuarioModalbtnEditar');
                usuarios_module.EditarUsuario(this.id);
            }
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#AgregarUsuarioModal').modal('hide');
        });
       
    });
    //Eliminar
    $('#UsuariosModal').on('click','.UsuariosModalbtnEliminar',function () {  
        usuarios_module.ValidatePrivileges().then(()=>{
            if(confirm("¿Seguro que desea eliminar este usuario?")){
                usuarios_module.EliminarUsuario(this.id);
            }
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });
        
    });
    //Submit
    $('#AgregarUsuarioModalForm').on('submit',function(e){
        e.preventDefault();
        usuarios_module.ValidatePrivileges().then(()=>{
            let IsEdit = $(document.activeElement)[0].id == "AgregarUsuarioModalbtnEditar" ? true : false;
            usuarios_module.ValidarUsuario(getFormData($(this)),IsEdit );
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });
       
    });

    // Cuenta Modal

    $('#CuentaModal').on('show.bs.modal',function () {
        let usuario = JSON.parse(sessionStorage.getItem("Session"));
        if(usuario == null){
            return;
        }
        $('#CuentaModalStatus').removeClass('d-none');
        $('#CuentaModalForm').addClass('d-none');
        usuarios_module.ObtenerCuenta().then((response)=>{
            
            $('#CuentaModaltxtID').val(response[0]["Id"]);
            $('#CuentaModaltxtNombres').val(response[0]["Nombres"]);
            $('#CuentaModaltxtUsuario').val(response[0]["Usuario"]);
            $('#CuentaModaltxtEmail').val(response[0]["Email"]);
        if(usuario["Usuario"] == "administrador.scada"){
            $('#CuentaModaltxtNombres').attr('readonly',true);
            $('#CuentaModaltxtUsuario').attr('readonly',true);
        }else{
            $('#CuentaModaltxtNombres').attr('readonly',false);
            $('#CuentaModaltxtUsuario').attr('readonly',false);
        }
        $('#CuentaModalStatus').addClass('d-none');
        $('#CuentaModalForm').removeClass('d-none');
        $('#CambiarContraseniaModalForm').trigger('reset');
        }).catch(error =>{
            toastr.error("¡Error! Fallo al obtener los datos del usuario","¡Error!",{
                progressBar:true,
                closeButton:true
            });
            $('#CuentaModalStatus').attr('src','../img/Error.png');
            $('#CuentaModallblStatus').html("¡Error!");
        });

        
    });

    //submit cuenta

    $('#CuentaModalForm').on('submit',function(e){
        e.preventDefault();
        let data = getFormData($(this));
        $('#AgregarUsuarioModaltxtID').val(data["Id"]);
        usuarios_module.ValidarUsuario(data,true,true);
    });

    // Cambiar Contraseña Modal

    $('#CuentaModalbtnContrasenia').on('click',function(e){
        e.preventDefault();
        $('#CambiarContraseniaModaltxtID').val($('#CuentaModaltxtID').val());
        $('#CambiarContraseniaModal').modal({ show:true, backdrop: false });    
    });

    $('#CambiarContraseniaModalForm').on('submit',function(e){
        e.preventDefault();
        usuarios_module.ActualizarContraseña(getFormData($(this)));
    });


    //Reportes

    $('#MenubtnReportes').on('click',function(){
            $('#ReportesModalDate').attr('disabled',true)
           $('#ReportesModalbtnFiltrar').attr('disabled',true);
        usuarios_module.ValidatePrivileges(true).then(()=>{
            $('#ReportesModalDate').attr('disabled',false)
           $('#ReportesModal').modal('show');
           $('#ReportesModalbtnFiltrar').attr('disabled',false);
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });
    });

    $('#ReportesModal').on('show.bs.modal',function () {  
        $('#ReportesContent').addClass('d-none');
        $('#ReportesStatus').removeClass('d-none');
        usuarios_module.ValidatePrivileges().then(()=>{
            $('#ReportesContent').removeClass('d-none');
            $('#ReportesStatus').addClass('d-none');
            let start_date = dispositivos_module.formatDate($('#ReportesModalDate').data('daterangepicker').startDate._d);
            let end_date = dispositivos_module.formatDate($('#ReportesModalDate').data('daterangepicker').endDate._d);
            let nivel = $('#ReportesModalcmbFilter').val();
            reportes_module.ObtenerReportes(start_date,end_date,nivel);
         }).catch(error => {
             toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                 progressBar:true,
                 closeButton:true
             });
             $('#ReportesModalStatus').attr('src','../img/Deny.png');
             $('#ReportesModallblStatus').html("¡Acceso Denegado!")
         });
        
    });

    $('#ReportesModalbtnFiltrar').on('click',function () { 
        usuarios_module.ValidatePrivileges(true).then(()=>{
            let start_date = dispositivos_module.formatDate($('#ReportesModalDate').data('daterangepicker').startDate._d);
            let end_date = dispositivos_module.formatDate($('#ReportesModalDate').data('daterangepicker').endDate._d);
            let nivel = $('#ReportesModalcmbFilter').val();
            reportes_module.ObtenerReportes(start_date,end_date,nivel);
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });
        
    });
    
    $('#ReportesModalcmbFilter').on('change',function(){
        usuarios_module.ValidatePrivileges(true).then(()=>{
            let start_date = dispositivos_module.formatDate($('#ReportesModalDate').data('daterangepicker').startDate._d);
            let end_date = dispositivos_module.formatDate($('#ReportesModalDate').data('daterangepicker').endDate._d);
            let nivel = $('#ReportesModalcmbFilter').val();
            reportes_module.ObtenerReportes(start_date,end_date,nivel);
        }).catch(error => {
            toastr.error("¡Error! Fallo al verificar los privilegios de usuario\n<b>\"Acceso Denegado\"</b>","¡Error!",{
                progressBar:true,
                closeButton:true
            });
        });
        
    });

    $('select.color').selectpicker();
    $('.selectpicker').selectpicker({
        dropupAuto: false,
        size:4
    });
    $('#ReportesModalcmbFilter').selectpicker({
        dropupAuto: false,
        size:5
    });

    $('input[name="dates"]').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        } 
    },function(start){ //Callback
        let start_date = dispositivos_module.formatDate($('#ReportesModalDate').data('daterangepicker').startDate._d);
        let end_date = dispositivos_module.formatDate($('#ReportesModalDate').data('daterangepicker').endDate._d);
        let nivel = $('#ReportesModalcmbFilter').val();
        reportes_module.ObtenerReportes(start_date,end_date,nivel);
    });
    $('#ReportesModalTable').DataTable(
        {
            responsive:true,
            "columns":[
                {"data":"Nivel"},
                {"data":"Nombre Variable"},
                {"data":"Fecha"},
                {"data":"Hora"},
                {"data":"Valor"},
                {"data":"Usuario"},
                {"data":"Nombre Dispositivo"},
                {"data":"Condicion"},
                {"data":"Mensaje"},
            ]
        });
    });

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
    let a;
    a = this;
    for (let k in arguments) {
      a = a.replace("{" + k + "}", arguments[k])
    }
    return a
}

function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

$('#AgregarProyectoModalbtnAceptar').on('click',function (e) {
            
    let Nombre = $('#AgregarProyectoModaltxtNombre').val();
    if(Nombre == "" || dispositivos_module.IsNumeric(Nombre)){
        toastr.error("Nombre ingresado no valido","¡Error!",{
            "closeButton":true,
            "progressBar":true
        });
    }else{
        if(!confirm("¿Seguro? Cambios sin guardarse podrian perderse")){deferred.reject(false);}
        let newproject = {
            "Id":dispositivos_module.GenerateObjectId(),
            "Nombre": Nombre,
            "DriversCount":0,
            "Drivers":[],
        }
        if($('#AgregarProyectoModaltxtNombre').data('SaveAs') == true){
            let drivers =  [];
            (JSON.parse(sessionStorage.getItem("SessionProject")))["Drivers"].forEach(x => {
                x["UnicID"] = dispositivos_module.GenerateGUID();
                drivers.push(x);
            });
            newproject["Drivers"] = drivers
        }else{
            sessionStorage.setItem("SessionProject",JSON.stringify(newproject));
            dispositivos_module.MostrarDispositivos(newproject);
        }
        toastr.success("Proyecto creado correctamente","¡Exito!",{
            "closeButton":true,
            "progressBar":true
        });
        dispositivos_module.Guardar(newproject);
        $('#AgregarProyectoModal').modal('hide');
    }
});


$('#AgregarProyectoModal').on('show.bs.modal',function(){
    $('#AgregarProyectoModaltxtNombre').val(""); 
});
  
function ValidateSingleInput(oInput,_validFileExtension) {
    for (let i = 0; i < _validFileExtension.length; i++) {
        if(oInput.type == _validFileExtension[i]){
            return true;
        }
    }
    return false;
}


(function($, window) {
    'use strict';

    var MultiModal = function(element) {
        this.$element = $(element);
        this.modalCount = 0;
    };

    MultiModal.BASE_ZINDEX = 1040;

    MultiModal.prototype.show = function(target) {
        var that = this;
        var $target = $(target);
        var modalIndex = that.modalCount++;

        $target.css('z-index', MultiModal.BASE_ZINDEX + (modalIndex * 20) + 10);

        // Bootstrap triggers the show event at the beginning of the show function and before
        // the modal backdrop element has been created. The timeout here allows the modal
        // show function to complete, after which the modal backdrop will have been created
        // and appended to the DOM.
        window.setTimeout(function() {
            // we only want one backdrop; hide any extras
            if(modalIndex > 0)
                $('.modal-backdrop').not(':first').addClass('hidden');

            that.adjustBackdrop();
        });
    };

    MultiModal.prototype.hidden = function(target) {
        this.modalCount--;

        if(this.modalCount) {
           this.adjustBackdrop();
            // bootstrap removes the modal-open class when a modal is closed; add it back
            $('body').addClass('modal-open');
        }
    };

    MultiModal.prototype.adjustBackdrop = function() {
        var modalIndex = this.modalCount - 1;
        $('.modal-backdrop:first').css('z-index', MultiModal.BASE_ZINDEX + (modalIndex * 20));
    };

    function Plugin(method, target) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('multi-modal-plugin');

            if(!data)
                $this.data('multi-modal-plugin', (data = new MultiModal(this)));

            if(method)
                data[method](target);
        });
    }

    $.fn.multiModal = Plugin;
    $.fn.multiModal.Constructor = MultiModal;

    $(document).on('show.bs.modal', function(e) {
        $(document).multiModal('show', e.target);
    });

    $(document).on('hidden.bs.modal', function(e) {
        $(document).multiModal('hidden', e.target);
    });
}(jQuery, window));
