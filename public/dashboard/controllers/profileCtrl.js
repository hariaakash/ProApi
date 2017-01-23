// Profile Controller
angular.module('proApp')
	.controller('profileCtrl', function ($scope, $rootScope, $routeParams, $http, $location, $timeout) {
		$rootScope.checkAuth();
	});
