//inicializa la aplicación, en este caso, 'myApp' es el nombre de la aplicación,
//en el segundo parámetro (arreglo), se especifican los módulos extra que
//angular deba incluir, en este caso ninguno
var myApp = angular.module('myApp',[]);

//se adigna el controlador 'AppCtrl' a la aplicación, para que pueda ser
//accedido desde la vista por angular
//$scope define las variables que son accesibles en la vista mediante angular
//(en donde se utilice el controlador 'AppCtrl')
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {
  //ejecuta una petición post a la ruta '/savefile'
  //se asigna a scope para que pueda ser accedido desde la vista
  $scope.saveFile = function() {
    $http.post('/savefile',$scope.request);
  };
}]);
