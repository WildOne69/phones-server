//librerías requeridas
//assert, para validar errores o resultados
var assert = require('assert');
//requerida para poder acceder al querpo de la request
var bodyParser = require('body-parser');
//sistema de archivos
var fs = require('fs');
//utilerías
var util = require('util');
//conversor de xml a json, para facilitar la edicion
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var builder = new xml2js.Builder();
//express se encarga del ruteo, redirige desde el controller a los respectivos
//'urls' en el servidor (gets y posts)
var express = require('express');
var app = express();

////////////////////////////////////////////////////////////////////////////////

//directorio donde se encuentran los controladores, las vistas y todo lo que sea
//públicamente accesible
app.use(express.static(__dirname + "/public"));
//para acceder al body de la request
app.use(bodyParser.json());

//recibe un get request hecho desde el controlador, el parámetro 'req' es
//equivalente a la solicitud hecha desde el controlador, el atributo req.body
//contiene, en formato json, las variables que se envía como parámetro desde el
//controlador. el parámetro 'res' funciona similar a un retorno, los cambios
//hechos en el podrán ser accesibles desde el controlador una vez se de la
//respuesta
app.post('/savefile', function(req, res) {
  //requerido para realizar la conección via ssh al servidor
  connect = require('ssh2-connect');
  //requerido para acceder al sistema de archivos del servidor via ssh
  fs = require('ssh2-fs');

  //se conecta al servidor con los credenciales especificados a continuación
  connect({
    //dirección del servidor donde se ubican los archivos de configuración
    host: '172.24.27.4',
    //puerto al cual establecer la conección (22 es el puerto por defecto de ssh)
    port: 22,
    //usuario con el que se establece la conección al server (root porque tiene
    //los privilegios necesarios para crear, modificar y eliminar archivos en
    //cualquier ubucación, podría pensarse en crear un usuario nuevo con los
    //privilegios necesarios únicamente para este sistema)
    username: 'root',
    //de momento para conectar se está utilizando la contraseña de root, lo cual
    //es inseguro, debería generarse una clave ssh autorizada, pero para efectos
    //de facilidad y pruebas, aún no
    password: 'elastixsc2014'}, function(err, ssh){
      //el parámetro 'err' determina si la conección se realizó con éxito, de ser
      //así, el parámetro 'ssh' es equivalente a la conexión como tal

      //si ocurrió algún error al realizar la conexión, lanza una excepción y
      //termina la ejecución
      if (err) throw err;

      //para no tener que crear el archivo desde cero, si no, unicamente
      //modificar los campos requeridos se lee la plantilla ubicada en la
      //siguiente ruta y se realizan los cambios sobre esta
      //para efectos de pruebas unicamente se trabaja con el modelo 41/61
      //luego hay que ampliarlo a que el usuario pueda seleccionar el modelo
      //y cargar la plantilla segun su eleccion
      fs.readFile(ssh, '/tftpboot/Documentacion y Plantillas/7941-7961/SEPXXXXXXXXX.cnf.xml', function (err, data) {
        //valida que la plantilla se haya leído exitosamente
        if (err) throw err;

        //en vista que el xml es leído como un string y acceder los tags que se
        //van a modificar de esta manera es sumamente complicado, este es
        //convertido a formato json, para poder trabajar como si fuera un objeto
        //y acceder a los atributos directamente
        //sin embargo, la estructura de dicho json sigue siendo bastante
        //compleja, luego de inspeccionar el objeto se determinó como acceder
        //a los atributos que se van a modificar
        parser.parseString(data, function(err, jsonFile) {
          //nombre a mostrar en la pantalla del teléfono
          jsonFile.device.sipProfile[0].phoneLabel[0] = req.body.nom;
          //cada uno de los siguientes debe ser igual al número de extensión que
          //se le va a asignar al dispositivo
          jsonFile.device.sipProfile[0].sipLines[0].line[0].featureLabel[0] = req.body.ext;
          jsonFile.device.sipProfile[0].sipLines[0].line[0].name[0] = req.body.ext;
          jsonFile.device.sipProfile[0].sipLines[0].line[0].displayName[0] = req.body.ext;
          jsonFile.device.sipProfile[0].sipLines[0].line[0].contact[0] = req.body.ext;
          jsonFile.device.sipProfile[0].sipLines[0].line[0].authName[0] = req.body.ext;

          //una vez que se han modificado los valores requeridos, se regresa a
          //formato xml
          var xmlFile = builder.buildObject(jsonFile);

          //escribe en el archivo especificado en el segundo parámetro (numero
          //de mac) el texto enviado en el tercer parámetro, si el archivo no
          //existe, lo crea, si existe, lo sobreescribe. La función enviada como
          //parámetro (callback), define las acciones a realizar una vez se haya
          //creado o no el archivo.
          fs.writeFile(ssh, '/SEP' + req.body.mac + '.cnf.xml',  xmlFile, function (err) {
            if (err) throw err;
            console.log('Archivo creado con éxito');
          });
        });
      });
    });
  });

//ejecuta la aplicación sobre el puerto 3000
app.listen(3000);

//notifica sobre el puerto en el cual se está ejecutando la aplicación
console.log("Server running on port 3000");
