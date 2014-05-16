var mainApp = angular.module('mainApp', ['ngRoute']);

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

mainApp.controller('mainCtrl', ['$http','$scope', function($http, $scope){
	$scope.data = {
		page : 0, // 0 is profile, 1 is quiz, 2 is notes
		note_words : []
	};
	$scope.request = {
		word : ""
	};
	$scope.response = {
		quick_def : "Hola!", // default
		more_def : ""
	};
	this.submit = function() {
		$http.post('/api/translate', $scope.request)
		.success(function(data){
			console.log(data);
			$scope.response.quick_def = data;
		})
	};
	this.select = function(number) {
		$scope.data.page = number;
	};
}]);
