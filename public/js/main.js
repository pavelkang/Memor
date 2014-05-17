var mainApp = angular.module('mainApp', ['ngRoute']);

mainApp.factory('Data', function() {
	return {
		name : "",
		page : 0,
		stored : {word:"", quick_def:""},
		data : {note_words:[], noOfUnits:1},
		request : {word:""},
		response : {quick_def:"Hola"}
	};
});

mainApp.config(['$routeProvider', function($routeProvider){
	$routeProvider.
	when('/profile', {
		templateUrl : '/partials/profile.html',
		controller : 'ProfileController'
	}).
	when('/quiz', {
		templateUrl : '/partials/quiz.html',
		controller : 'QuizController'		
	}).
	when('/note', {
		templateUrl : '/partials/note.html',
		controller : 'NoteController'		
	}).
	otherwise({
		redirectTo : '/profile'
	});
}])

mainApp.controller('mainCtrl', function($http, $scope, Data){
	$scope.data = Data;
	$http.get('/profile').success(function(data){
		if (data.google) {
			$scope.data.name = data.google.name;
		}
		else {
			$scope.data.name = data.facebook.name;
		}
		console.log(data);
	})

	$scope.addToNote = function() {
		var element = [$scope.data.stored.word , $scope.data.response.quick_def];
		if (!(elemInArray(element, $scope.data.data.note_words))) {
			$scope.data.data.note_words.push(element);			
		};
	}
	$scope.submit = function() {
		$scope.data.stored.word = $scope.data.request.word;
		$http.post('/api/translate', $scope.data.request)
		.success(function(data){
			$scope.data.response.quick_def = data;
			$scope.data.stored.quick_def = data;
		})
	};
	$scope.select = function(number) {
		$scope.data.page = number;
	};
	$scope.isSelected = function(number) {
		return $scope.data.page === number;
	};
});

mainApp.controller('ProfileController',function($scope){

});
mainApp.controller('NoteController',function($scope, Data){
	$scope.test = "HI";
	$scope.data = Data;
	$scope.testNote = function() {console.log($scope.data);}
});
mainApp.controller('QuizController',function($scope){

});

// Helper function
var elemInArray = function(elem, array) {
	// elem is of type array
	for (var i=0; i<array.length; i++) {
		if (array[i][0] === elem[0]) {
			return true;
		}
	}
	return false;
}