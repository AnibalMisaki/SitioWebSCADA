export function ObtenerReportes(start_date,end_date,nivel) {

    $.ajax({
        url: `https://${settings['Host']}:${settings['Port']}/Reportes/ObtenerReportes/{0}/{1}/{2}`.format(start_date,end_date,nivel),
        type: 'GET',
        dataType:'json',
        beforeSend:function(request){
            let access_token = JSON.parse(sessionStorage.getItem("Session"))["access_token"];
            request.setRequestHeader("Authorization","Bearer {0}".format(access_token));
        },
        success:function(answer){
            let table = $('#ReportesModalTable').DataTable();
            table.clear();
            var temp = new Array();
            answer.forEach(r => {
                temp.push({
                    "Nivel":"<i class='fa fa-circle' style='color:{0};'></i>".format(new RGBColor(r["Nivel"]).toHex()),
                    "Nombre Variable":r["NombreVariable"],
                    "Fecha":r["Fecha"].substring(0,10),
                    "Hora":r["Hora"],
                    "Valor":r["Valor"],
                    "Usuario":r["Usuario"],
                    "Nombre Dispositivo":r["NombreDispositivo"],
                    "Condicion":r["Condicion"],
                    "Mensaje":r["Mensaje"]
                });
            });
            table.rows.add(temp).draw();
            //MostrarReportes(answer);
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
    });

}

function MostrarReportes(reportes){
    $('#ReportesModalTableBody').html("");

    $('#ReportesModalTableBody').append(`
        <tr>
            <td><i class='fa fa-circle red' style='color:#ffa500;'></i></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    `);

    $('#ReportesModalTable').DataTable().ajax.reload();
}