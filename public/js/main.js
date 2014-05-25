var mainApp = angular.module('mainApp', ['ngRoute', 'ui.bootstrap']);

mainApp.factory('Data', function() {
    return {
        name: "",
        page: 2, // select note as default
        stored: {
            word: "",
            quick_def: "",
            curr_unit: 0
        }, // the right pair
        data: {
            note_words: []
        }, // words in note/DB
        request: {
            word: ""
        }, // words currently in the blank
        units: [],
        status: {
            open: []
        }
    };
});


mainApp.controller('mainCtrl', function($http, $scope, Data) {
    $scope.data = Data;
    $scope.genTrueArray = genTrueArray;
    $http.get('/profile').success(function(data) {
        if (data.google) {
            $scope.data.name = data.google.name;
        } else {
            $scope.data.name = data.facebook.name;
        }
    });
    $scope.addToNote = function() {
        var element = {
            eng: $scope.data.stored.word,
            esp: $scope.data.stored.quick_def
        }
        if (element.eng && element.esp) {
            if (!(elemInArray(element, $scope.data.units))) {
                $http.post('/api/addWord', $scope.data.stored)
                    .success(function(resource) {
                        $scope.data.units[$scope.data.stored.curr_unit].eng.push(element.eng);
                        $scope.data.units[$scope.data.stored.curr_unit].esp.push(element.esp);
                        $scope.data.status.open[$scope.data.stored.curr_unit] = true;
                    });
            };
        }
    }
    //see result
    $scope.submit = function() {
        $scope.data.stored.word = $scope.data.request.word;
        $http.post('/api/translate', $scope.data.request)
            .success(function(data) {
                $scope.data.stored.quick_def = data;

            });
    };

    $scope.select = function(number) {
        $scope.data.page = number;
    };

    $scope.isSelected = function(number) {
        return $scope.data.page === number;
    };
});



mainApp.controller('NoteController', function($route, $scope, $http, Data) {
    $scope.data = Data;
    $scope.reloadPage = function() {
        window.location.reload();
    }
    $scope.oneAtATime = true;
    $scope.genTrueArray = genTrueArray;
    $http.get('/api/getWords')
        .success(function(user) {
            $scope.data.units = user.units;
            for (var i = 0; i < user.units[0].eng.length; i++) {
                var e = user.units[0].eng[i];
                var s = user.units[0].esp[i];
                var vocab = {
                    eng: e,
                    esp: s
                };
                $scope.data.data.note_words.push(vocab);
                $scope.data.status.open = genFalseArray($scope.data.units.length);
            }
        });
    $scope.addUnit = function() {
        $http.post('/api/addUnit', {})
            .success(function(data) {
                alert('Successful!');
                $scope.reloadPage();
            });
    }
});

mainApp.controller('ProfileController', function($scope) {

});

mainApp.controller('QuizController', function($scope, Data) {
    var hiddenStyle = {'visibility' : 'hidden'};
    var emptyStyle  =  {};    
    $scope.espStyle = hiddenStyle;
    $scope.data = Data;
    $scope.flag = {
        inQuiz: false
    }
    $scope.quiz = {
        problems: [{
            eng: 'Something is wrong',
            esp: 'sorry'
        }],
        index: 0
    }
    $scope.genFalseArray = genFalseArray;
    $scope.data.selectedItems = genFalseArray($scope.data.units.length);
    $scope.goQuiz = function() {
        if (allFalse($scope.data.selectedItems)) {
            alert('You need to select at least 1 unit!');
            return null;
        }
        //TODO set $scope.quiz.problems
        var alreadySelected = 0;
        // Help construct $scope.quiz.problems
        var preEng = [];
        var preEsp = [];
        var selectedIndices = getSelectedUnits($scope.data.selectedItems);
        var probNumber = 10;
        var actualNumber = getNumberOfWords(selectedIndices, $scope.data.units);
        if ( actualNumber === 0) {
            alert('No words in selected units!');
            return null;
        }
        else {
            if ( actualNumber < probNumber ) {
                probNumber = actualNumber;
            }
        }
        // Randomly get 10 pairs
        while (alreadySelected != probNumber) {
            // choose a unit
            var unitIndex = randomElementFromArray(selectedIndices);
            var unit = $scope.data.units[unitIndex];
            if (unit.eng.length === 0) {continue;}
            var eng = randomElementFromArray(unit.eng);
            if (preEng.indexOf(eng) === -1) {
                var esp = unit.esp[unit.eng.indexOf(eng)];                
                preEng.push(eng);
                preEsp.push(esp);
                alreadySelected += 1;
            }
        }
        $scope.quiz.problems = generateQuiz(preEng, preEsp);
        alert('The quiz begins!');
        $scope.flag.inQuiz = true;
        //TODO clear $scope.data.selectedItems
        $scope.data.selectedItems = genFalseArray($scope.data.units.length);
    }
    $scope.goBack = function() {
        alert('Give up the quiz!');
        $scope.flag.inQuiz = false;
        $scope.quiz.index = 0;
        $scope.espStyle = hiddenStyle;
    }
    $scope.goBackProb = function() {
        if ($scope.quiz.index > 0) {
            $scope.espStyle = hiddenStyle;            
            $scope.quiz.index -= 1;
        }
    }
    $scope.goForwardProb = function() {
        if ($scope.quiz.index < $scope.quiz.problems.length - 1) {
            $scope.espStyle = hiddenStyle;                    
            $scope.quiz.index += 1;
        } else { if ($scope.quiz.index === $scope.quiz.problems.length - 1) {
            alert('Quiz finished!');
            $scope.flag.inQuiz = false;
            $scope.quiz.index = 0;
            $scope.espStyle = hiddenStyle;
        }}
    }
    $scope.show = function() {
        $scope.espStyle = emptyStyle;
    }
});



mainApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/home', {
            templateUrl: '/partials/profile.html',
            controller: 'ProfileController'
        }).
        when('/quiz', {
            templateUrl: '/partials/quiz.html',
            controller: 'QuizController'
        }).
        when('/note', {
            templateUrl: '/partials/note.html',
            controller: 'NoteController'
        }).
        otherwise({
            redirectTo: '/note'
        });
    }
])

// Helper function
var elemInArray = function(elem, array) {
    // elem is of type array
    for (var i = 0; i < array.length; i++) {
        unit = array[i];
        for (var j = 0; j < unit.eng.length; j++) {
            if (unit.eng[j] == elem.eng) {
                return true;
            }
        }
    }
    return false;
}

var genTrueArray = function(len) {
    // generates an array of true with length len
    result = [];
    for (var i = 0; i < len; i++) {
        result.push(true);
    }
    return result;
}

var genFalseArray = function(len) {
    // generates an array of true with length len
    result = [];
    for (var i = 0; i < len; i++) {
        result.push(false);
    }
    return result;
}

var getRandomIndex = function(len) {
    // returns a random number from 0 to len-1
    return Math.floor(Math.random() * len);
}

var allFalse = function(array) {
    // returns true if array contains only False
    for (var i=0; i<array.length; i++) {
        if (array[i])
            return false;
    }
    return true;
}

var getSelectedUnits = function(selectedItems) {
    // returns an array of indices of selected items
    var result = [];
    for (var i=0; i<selectedItems.length; i++) {
        if (selectedItems[i])
            result.push(i);
    }
    return result;
}

var randomElementFromArray = function(array) {
    return array[Math.floor(Math.random()*array.length)];
}

//var actualNumber = getNumberOfWords(selectedIndices, $scope.data.units);
var getNumberOfWords = function(indices, units) {
    var result = 0;
    for (var i=0; i<indices.length; i++) {
        var index = indices[i];
        var unit  = units[index];
        result += unit.eng.length;
    }
    return result;
}

//$scope.quiz.problems = generateQuiz(preEng, preEsp);
var generateQuiz = function(english, espanol) {
    var result = [];
    for (var i=0; i<english.length; i++) {
        result.push({eng:english[i], esp:espanol[i]});
    }
    return result;
}