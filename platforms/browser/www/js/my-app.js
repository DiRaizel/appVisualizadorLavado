//
var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'My App',
    // App id
    id: 'com.visualizadorLavado',
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
var ipServidor = '';
var idEmpresa = '';
var urlServer = '';
var urlVideos = '';
var urlImagen = '';

//
var $$ = Dom7;

//
var mainView = app.views.create('.view-main');

//
var arrayT = [];
var arrayC = [];
var arrayV = [];
var visualizador = 0;
var videoA = 0;
var sigTurno = false;

//
document.addEventListener('deviceready', function () {
    //
    if (localStorage.ipServidor === undefined) {
        //
        app.dialog.prompt('', 'Ip Servidor?', function (ip) {
            //
            localStorage.ipServidor = ip;
            ipServidor = ip;
            urlServer = 'http://' + ip + '/phpVisualizadores/VisualizadorLavadoPhp/';
            comprobarEmpresa();
        });
    } else {
        //
        ipServidor = localStorage.ipServidor;
        urlServer = 'http://' + ipServidor + '/phpVisualizadores/VisualizadorLavadoPhp/';
        comprobarEmpresa();
    }
});

//
function iniciar() {
    //inicializamos modal y voz para que lea el 1er paciente si ya hay alguno en espera antes de cargar la app
//    var modal = app.dialog.create({
//        title: 'MAMA',
//        text: 'MIA'
//    }).open();
    voz('', 0);
//    modal.close();
    //
    if (localStorage.visualizador === undefined) {
        //
        cargarListaVisualizadores(1);
    } else {
        //
        visualizador = localStorage.visualizador;
        //
        establecerUrls();
        cargarListaVisualizadores(2);
    }
    //
    setInterval(function () {
        //
        app.request.post(urlServer + 'Read/fechaHora', {},
                function (rsp) {
                    //
                    var data = JSON.parse(rsp);
                    //
                    $$('#fecha').html(data.fecha);
                    $$('#hora').html(data.hora);
                });
    }, 5000);
}

//
function editarIpServidor() {
    //
    app.dialog.prompt('', 'Ip servidor', function (ip) {
        //
        localStorage.ipServidor = ip;
        ipServidor = ip;
        urlServer = 'http://' + ip + '/phpVisualizadores/VisualizadorLavadoPhp/';
        comprobarEmpresa();
    });
}

//
function comprobarEmpresa() {
    //
    if (localStorage.idEmpresa === undefined) {
        //
        app.dialog.prompt('', 'Id empresa', function (id) {
            //
            localStorage.idEmpresa = id;
            idEmpresa = id;
            iniciar();
        });
    } else {
        //
        idEmpresa = localStorage.idEmpresa;
        iniciar();
    }
}

//
function editarIdEmpresa() {
    //
    app.dialog.prompt('', 'Id empresa', function (id) {
        //
        localStorage.idEmpresa = id;
        idEmpresa = id;
        iniciar();
    });
}

//
function cargarListaVisualizadores(valor) {
    //
    app.request.post(urlServer + 'Read/cargarListaVisualizadores', {empresa: idEmpresa},
            function (rsp) {
                //
                var data = JSON.parse(rsp);
                //
                if (data.length > 0) {
                    //
                    var camposV = '<p>Seleccionar visualizador</p><div class="list"><ul>';
                    //
                    for (var i = 0; i < data.length; i++) {
                        //
                        camposV += '<li><a class="list-button item-link" href="#" onclick="visualizadorSeleccionado(' + data[i] + ')">Visualizador ' + data[i] + '</a></li>';
                    }
                    //
                    camposV += '</ul></div>';
                    //
                    document.getElementById("divListaVisualizadores").innerHTML = camposV;
                    //
                    if (valor === 1) {
                        //
                        document.getElementById("btnListaVisualizadores").click();
                    }
                }
            });
}

//
function visualizadorSeleccionado(valor) {
    //
    for (var i = 0; i < 5; i++) {
        //
        $$('#empleado' + i).html('');
    }
    //
    arrayT = [];
    arrayC = [];
    arrayV = [];
    visualizador = 0;
    videoA = 0;
    sigTurno = false;
    //
    visualizador = valor;
    localStorage.visualizador = visualizador;
    //
    establecerUrls();
    //
    app.popup.close('.popover-visualizadores', true);
}

//
function establecerUrls() {
    //
    urlImagen = 'http://' + ipServidor + '/lavadoTemp/imagenes/' + idEmpresa + '/' + visualizador + '/';
    urlVideos = 'http://' + ipServidor + '/lavadoTemp/videos/' + idEmpresa + '/' + visualizador + '/';
    //
    consultarPersonas();
    cargarConfig();
    cargarVideos();
    actualizarTurnos();
    cargarMensajes();
}

//
function cargarVideos() {
    //
    app.request.post(urlServer + 'Read/cargarVideos', {visualizador: visualizador, empresa: idEmpresa},
            function (rsp) {
                //
                var data = JSON.parse(rsp);
                //
                if (data.length > 0) {
                    //
                    arrayV = data;
                    //
                    if (videoA === 0) {
                        //
                        actualizarVideos();
                    }
                } else {
                    actualizarVideos();
                }
            });
}

//
function actualizarVideos() {
    //
    var videoR = document.getElementById("video");
    //
    if (arrayV.length === videoA) {
        //
        videoA = 0;
    }
    //
    if (arrayV.length > 0) {
        //
        $$('#imagenV').css('display', 'none');
        //
        var vol = (arrayV[videoA]['volumen'] > 9) ? 1 : parseFloat("0." + arrayV[videoA]['volumen']);
        //
        videoR.volume = vol;
        //
        document.getElementById("video").innerHTML = '<source src="' + urlVideos + arrayV[videoA]['nombreVideo'] + '.mp4' + '" type="video/mp4">';
        //
        videoR.load();
        videoR.play();
        //
        videoA++;
    } else {
        //
        $$('#video').css('display', 'none');
    }
    //
    setInterval(function () {
        //
        if (videoR.ended) {
            //
            actualizarVideos();
        }
    }, 1000);
}

//
function cargarConfig() {
    //
    app.request.post(urlServer + 'Read/cargarConfig', {visualizador: visualizador, empresa: idEmpresa},
            function (rsp) {
                //
                var data = JSON.parse(rsp);
                //
                if (data.length > 0) {
                    //
                    for (var i = 0; i < 5; i++) {
                        //
                        document.getElementById("empleado" + i).style.fontSize = data[0]['tamanoLetra'] + 'px';
                    }
                    //
                    var valorT = data[0]['tamanoLetra'] / 2;
                    document.getElementById("divFecha").style.fontSize = valorT + 'px';
                    document.getElementById("mesaje").style.fontSize = data[0]['tamanoLetra'] + 'px';
                    //
                    if (data[0]['imagen'] !== '') {
                        //
                        document.getElementById("imagenV").setAttribute('src', urlImagen + data[0]['imagen']);
                    }
                    //
                    if (data[0]['nombrelogo'] !== '') {
                        //
                        document.getElementById("logoCambiar").setAttribute('src', urlImagen + data[0]['nombrelogo']);
                    }
                    //
                    $$('#mesaje').html('<MARQUEE WIDTH=100%>' + data[0]['mensaje'] + '</MARQUEE>');
                    //
                    arrayC = data[0];
                } else {
                    //
                    app.dialog.alert('Error al Cargar', 'Alerta');
                }
            });
}

//
function actualizarTurnos() {
    //
    setInterval(function () {
        //
        if (arrayTV.length > 0) {
            //
            for (var i = 0; i < arrayTV.length; i++) {
                //
                $$('#empleado' + i).html(arrayTV[i]['nombre']);
            }
            //
            var pos = arrayTV.length;
            //
            if (pos < 5) {
                //
                for (var w = pos; w < 5; w++) {
                    //
                    $$('#empleado' + w).html('');
                }
            }
        }
    }, 1000);
}

//
function voz(text, volumen) {
    //
    var u = new SpeechSynthesisUtterance();
    //
    u.text = text;
    u.lang = 'es-ES';
    u.volume = volumen;
    speechSynthesis.speak(u);
}

//
function consultarPersonas() {
    //
    app.request.post(urlServer + 'Read/cargarPersonas', {visualizador: visualizador, empresa: idEmpresa},
            function (rsp) {
                //
                var data = JSON.parse(rsp);
                //
                if (data !== 2) {
                    //
                    arrayT = data;
                    //
                    consultarPersona();
                } else {
                    //
                    siguienteTruno();
                }
            }, function (error) {
        //
        siguienteTruno();
    });
}

//
var arrayTV = [];
var controlAT = 0;

//
function consultarPersona() {
    //
    if (arrayT.length > 0) {
        //
        app.request.post(urlServer + 'Read/consultarPersona', {idPer: arrayT[controlAT]['idPer']},
                function (rsp) {
                    //
                    var data = JSON.parse(rsp);
                    //
                    if (data !== 2) {
                        //
                        if (data[0]['estado'] === '1') {
                            //
                            for (var i = 0; i < arrayTV.length; i++) {
                                //
                                if (arrayTV[i]['idPer'] === arrayT[controlAT]['idPer']) {
                                    //
                                    arrayTV.splice(i, 1);
                                    arrayT.splice(controlAT, 1);
                                }
                            }
                            //
                            consultarPersona();
                        } else {
                            //
                            if (arrayTV.length > 0) {
                                //
                                var j = -1;
                                //
                                for (var i = 0; i < arrayTV.length; i++) {
                                    //
                                    if (arrayTV[i]['idPer'] === arrayT[controlAT]['idPer']) {
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
                                            arrayTV[j] = arrayT[controlAT];
                                        } else {
                                            //
                                            arrayTV[j] = arrayTV[j - 1];
                                        }
                                        //
                                        j--;
                                    }
                                } else {
                                    //
                                    var k = arrayTV.length;
                                    //
                                    if (k > 4) {
                                        //
                                        k = 4;
                                    }
                                    //
                                    while (k > 0) {
                                        //
                                        arrayTV[k] = arrayTV[k - 1];
                                        //
                                        k--;
                                        //
                                        if (k === 0) {
                                            //
                                            arrayTV[k] = arrayT[controlAT];
                                        }
                                    }
                                }
                            } else {
                                arrayTV[0] = arrayT[controlAT];
                            }
                            //
                            controlAT++;
                            //
                            if (controlAT === arrayT.length) {
                                //
                                controlAT = 0;
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
                            var VolumenVoz = 0;
                            //
                            VolumenVoz = (parseInt(arrayC.volumenVoz));
                            VolumenVoz = (VolumenVoz > 9) ? 1 : parseFloat("0." + VolumenVoz);
                            //
                            var video = document.getElementById("video");
                            video.muted = true;
                            //
                            mensaje = "atencion " + arrayTV[0]['nombre'] + " recuerde labarse las manos";
                            voz(mensaje, VolumenVoz);
                            //
                            var intervaloV = setInterval(function () {
                                //
                                video.muted = false;
                                //
                                clearInterval(intervaloV);
                            }, 7000);
                            //
                            siguientePos();
                        }
                    }
                }, function (error) {
            //
            siguientePos();
        });
    } else {
        //
        for (var w = 0; w < 5; w++) {
            //
            $$('#empleado' + w).html('');
        }
        //
        consultarPersonas();
    }
}

//
var intervaloP;

//
function siguientePos() {
    //
    intervaloP = setInterval(function () {
        //
        consultarPersona();
        //
        clearInterval(intervaloP);
    }, 10000);
}

//
function siguienteTruno() {
    //
    var intervaloT2 = setInterval(function () {
        //
        consultarPersonas();
        //
        clearInterval(intervaloT2);
    }, 10000);
}

//
var arrayM = [];
var controlM = 0;

//
function cargarMensajes() {
    //
    if (arrayM.length > 0) {
        //
        leerMensajes();
    } else {
        //
        app.request.post(urlServer + 'Read/cargarMensajes', {visualizador: visualizador, empresa: idEmpresa},
                function (rsp) {
                    //
                    var data = JSON.parse(rsp);
                    //
                    if (data !== 2) {
                        //
                        arrayM = data;
                        //
                        cicloMensajes();
                    } else {
                        //
                        cicloMensajes();
                    }
                }, function (error) {
            //
            cicloMensajes();
        });
    }
}

//
function cicloMensajes() {
    //
    var intervaloM = setInterval(function () {
        //
        cargarMensajes();
        //
        clearInterval(intervaloM);
    }, 10000);
}

function leerMensajes() {
    //
    if (arrayM.length > 0) {
        //
        if (controlM < arrayM.length) {
            //
            if (arrayM[controlM]['mensaje'] === 'Actualizar configtv') {
                //
                cargarConfig();
                cargarVideos();
                //
                controlM++;
                //
                cargarMensajes();
            } else {
                //
                clearInterval(intervaloP);
                //
                var VolumenVoz = 0;
                //
                VolumenVoz = (parseInt(arrayC.volumenVoz));
                VolumenVoz = (VolumenVoz > 9) ? 1 : parseFloat("0." + VolumenVoz);
                //
                var video = document.getElementById("video");
                video.muted = true;
                //
                mensaje = arrayM[controlM]['mensaje'];
                voz(mensaje, VolumenVoz);
                //
                controlM++;
                //
                var intervaloM = setInterval(function () {
                    //
                    cargarMensajes();
                    //
                    clearInterval(intervaloM);
                }, 10000);
            }
        } else {
            //
            arrayM = [];
            controlM = 0;
            cargarMensajes();
            siguientePos();
        }
    }
}