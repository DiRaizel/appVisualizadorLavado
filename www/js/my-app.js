//-----------------------------Reloj en vivo------------------------------------
var reloj = '';
//
function show5() {
    if (!document.layers && !document.all && !document.getElementById)
        return;

    var Digital = new Date();
    var hours = Digital.getHours();
    var minutes = Digital.getMinutes();
    var seconds = Digital.getSeconds();

    var dn = "PM";
    if (hours < 12)
        dn = "AM";
    if (hours > 12)
        hours = hours - 12;
    if (hours == 0)
        hours = 12;

    if (minutes <= 9)
        minutes = "0" + minutes;
    if (seconds <= 9)
        seconds = "0" + seconds;
    //change font size here to your desire
//    myclock = hours + ":" + minutes + ":" + seconds + " " + dn;
    myclock = hours + ":" + minutes + " " + dn;
    if (document.layers) {
        document.layers.liveclock.document.write(myclock);
        document.layers.liveclock.document.close();
    } else if (document.all)
        reloj = myclock;
    else if (document.getElementById)
        reloj = myclock;
    setTimeout("show5()", 1000);
}

//
var app = new Framework7({
    // App root element
    root: '#appVisualizadorE',
    // App Name
    name: 'visualizadorE',
    // App id
    id: 'com.visualizadorE',
    // Enable swipe panel
    panel: {
        swipe: 'left'
    },
    // Add default routes
    routes: [
        {
            path: '/home/',
            url: 'index.html'
        }
    ]
});

//
var $$ = Dom7;

//
var mainView = app.views.create('.view-main');

//
var arrayT = [];

//
document.addEventListener('deviceready', function () {
    //
    show5();
    //
    serial.requestPermission(successS, error);
    //
    for (var i = 0; i < 5; i++) {
        //
        document.getElementById("modulo" + i).style.fontSize = '7vh';
        document.getElementById("cliente" + i).style.fontSize = '7vh';
        document.getElementById("hora" + i).style.fontSize = '7vh';
    }
    //
    document.getElementById("fecha").style.fontSize = '3.5vh';
    document.getElementById("hora").style.fontSize = '3.5vh';
    //
    fecha();
    //
    setInterval(function () {
        //
        fecha();
    }, 1000);
    //
    cordova.plugins.CordovaMqTTPlugin.connect({
        url: 'tcp://165.227.89.32', //a public broker used for testing purposes only. Try using a self hosted broker for production.
        port: '1883',
        clientId: 'com.visualizadorE',
        willTopicConfig: {
            qos: 0, //default is 0
            retain: false, //default is true
            topic: "appLlamadoEnf/prueba",
            payload: ""
        },
        username: "fabian",
        password: '1234',
        success: function (s) {
            subscribirse();
        },
        error: function (e) {
//            console.log('error: ' + e);
        },
        onConnectionLost: function (e) {
//            console.log('conexion perdida: ' + e);
        }
    });
});

//
function fecha() {
    //
    var dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var fecha = new Date();
    var diaS = fecha.getDay();
    var diaM = fecha.getDate();
    var mes = fecha.getMonth();
    var year = fecha.getFullYear();
    $$('#fecha').html(dias[diaS] + ' ' + diaM + '/' + meses[mes] + '/' + year);
    $$('#hora').html(reloj);
}

//
function actualizarArrayTurnos(str, str2) {
    //
    if (arrayT.length > 0) {
        //
        var j = -1;
        //
        for (var i = 0; i < arrayT.length; i++) {
            //
            if (arrayT[i]['modulo'] === str && arrayT[i]['tipo'] === str2) {
                //
                j = i;
            }
        }
        //
        if (j !== -1) {
            //
            while (j >= 0) {
                //
                if (j === 0) {
                    //
                    arrayT[j] = {modulo: str, tipo: str2, hora: reloj};
                } else {
                    //
                    arrayT[j] = arrayT[j - 1];
                }
                //
                j--;
            }
        } else {
            //
            var k = arrayT.length;
            //
            if (k > 4) {
                //
                k = 4;
            }
            //
            while (k > 0) {
                //
                arrayT[k] = arrayT[k - 1];
                //
                k--;
                //
                if (k === 0) {
                    //
                    arrayT[k] = {modulo: str, tipo: str2, hora: reloj};
                }
            }
        }
    } else {
        //
        arrayT[0] = {modulo: str, tipo: str2, hora: reloj};
    }
    //
    actualizarTurnos();
}

//
function actualizarTurnos() {
    //
    if (arrayT.length > 0) {
        //
        for (var i = 0; i < arrayT.length; i++) {
            //
            $$('#modulo' + i).html(arrayT[i]['modulo']);
            $$('#cliente' + i).html(arrayT[i]['tipo']);
            $$('#hora' + i).html(arrayT[i]['hora']);
        }
    }
    //
    var controlColorDiv = false;
    var controlColorDivT = 0;
    //
    var intervaloC = setInterval(function () {
        //
        controlColorDivT++;
        //
        if (controlColorDiv) {
            //
            document.getElementById("conttL").style.background = "linear-gradient(to bottom, rgba(43,123,160,1) 0%, rgba(16,63,84,1) 100%)";
            document.getElementById("divcontt").style.border = "2px #256e90 solid";
            //
            controlColorDiv = false;
        } else {
            //
            document.getElementById("conttL").style.background = "linear-gradient(to bottom, rgba(156,34,46,1) 0%, rgba(156,34,46,1) 12%, rgba(221,75,86,1) 100%)";
            document.getElementById("divcontt").style.border = "2px #c93e4a solid";
            //
            controlColorDiv = true;
        }
        //
        if (controlColorDivT >= 10) {
            //
            document.getElementById("conttL").style.background = "linear-gradient(to bottom, rgba(43,123,160,1) 0%, rgba(16,63,84,1) 100%)";
            document.getElementById("divcontt").style.border = "2px #256e90 solid";
            //
            clearInterval(intervaloC);
            //
            controlColorDivT = 0;
        }
    }, 1000);
    //
//    var snd = new Audio("sound/new-guitar-sms.mp3");
    var snd = document.getElementById("audio");
    snd.load();
    snd.play();
}
//
function successS() {
    //
    serial.open({baudRate: 9600}, llamado, error);
}
//
function error(error) {
    //
    console.log(error);
}

//
function llamado() {
    //
    var errorCallback = function (message) {
        alert('Error: ' + message);
    };
    // register the read callback
    serial.registerReadCallback(
            function success(data) {
                // decode the received message
                var view = new Uint8Array(data);
//                var array = view.split(",");
                var str = '';
                var str2 = '';
                var control = true;
                var controlG = 0;
                var controlC = 0;
                var arrayD = [];
                //
                if (view.length >= 1) {
                    //
                    var i = 0;
                    //
                    while (i < view.length) {
                        // if we received a \n, the message is complete, display it
                        var temp_str = String.fromCharCode(view[i]);
                        var str_esc = escape(temp_str);
                        //
                        if (unescape(str_esc) == '*') {
                            //
                            if (i > 0) {
                                //
                                arrayD[controlC] = {h: str, cb: str2};
                                //
                                controlC++;
                                //
                                control = true;
                            }
                            //
                            str = '';
                            str2 = '';
                            //
                            i += 2;
                        } else {
                            //
                            if (unescape(str_esc) == ',') {
                                //
                                control = false;
                            }
                            //
                            if (control) {
                                //
                                str += unescape(str_esc);
                            } else {
                                //
                                if (controlG > 0) {
                                    //
                                    str2 += unescape(str_esc);
                                }
                                //
                                controlG++;
                            }
                            //
                            i++;
                        }
                        //
                        if (i === view.length) {
                            //
                            arrayD[controlC] = {h: str, cb: str2};
                        }
                    }
                }
                //
                if (arrayD.length > 0) {
                    //
                    for (var i = 0; i < arrayD.length; i++) {
                        //
                        if (arrayD[i]['h'] !== '' && arrayD[i]['cb'] !== '') {
                            //
                            var int2 = parseInt(arrayD[i]['cb']);
                            var h = 'Hab. ' + arrayD[i]['h'];
                            var cb = '';
                            //
                            if (int2 > 20) {
                                //
                                var b = int2 - 20;
                                //
                                cb = 'Baño ' + b;
                            } else {
                                //
                                cb = 'Cama ' + int2;
                            }
                            //
                            actualizarArrayTurnos(h, cb);
                        }
                    }
                }
            }, errorCallback // error attaching the callback
            );

}

//
function subscribirse() {
    //
    cordova.plugins.CordovaMqTTPlugin.subscribe({
        topic: 'appLlamadoEnf/prueba',
        qos: 0,
        success: function (s) {
            //
            cordova.plugins.CordovaMqTTPlugin.listen("appLlamadoEnf/prueba", function (payload, params) {
                //
                actualizarArrayTurnos('Domicilio', payload);
            });
        },
        error: function (e) {
            //alert("err!! something is wrong. check the console")
        }
    });
}