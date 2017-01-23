angular.module('proApp', ['ngRoute', 'angular-clipboard', 'angular-country-timezone-picker', 'angularUtils.directives.dirPagination'])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				redirectTo: '/home'
			})
			.when('/login', {
				templateUrl: 'pages/login.html',
				controller: 'loginCtrl'
			})
			.when('/register', {
				templateUrl: 'pages/register.html',
				controller: 'regCtrl'
			})
			.when('/acctMgmt', {
				templateUrl: 'pages/acctMgmt.html',
				controller: 'acctMgmtCtrl'
			})
			.when('/forgotPassword', {
				templateUrl: 'pages/forgotPassword.html',
				controller: 'forgotPasswordCtrl'
			})
			.when('/resendActivation', {
				templateUrl: 'pages/resendActivation.html',
				controller: 'resendActivationCtrl'
			})
			.when('/home', {
				templateUrl: 'pages/home.html',
				controller: 'homeCtrl'
			})
			.when('/box/:boxid', {
				templateUrl: 'pages/box.html',
				controller: 'boxCtrl'
			})
			.when('/profile', {
				templateUrl: 'pages/profile.html',
				controller: 'profileCtrl'
			})
			.when('/logs', {
				templateUrl: 'pages/logs.html',
				controller: 'logsCtrl'
			})
			.when('/error', {
				templateUrl: 'pages/error.html'
			})
			.otherwise({
				redirectTo: '/error'
			});
	});


// Global Controller
angular.module('proApp')
	.controller('globalCtrl', function ($rootScope, $location, $http, $routeParams) {
		$rootScope.userData = {};
		$rootScope.userData.info = {};
		$rootScope.getUserBoxes = function () {
			if ($rootScope.userData.status != true)
				$http({
					method: 'GET',
					url: 'http://localhost:3000/user/data',
					params: {
						authKey: $rootScope.authKey
					}
				}).then(function (res) {
					$rootScope.userData = res.data;
				}).catch(function () {
					swal({
						title: 'Some error occurred',
						type: 'error'
					});
				});
		};
		$rootScope.checkAuth = function () {
			if (Cookies.get('authKey')) {
				$rootScope.authKey = Cookies.get('authKey');
				var path = $location.path();
				if (path != '/home' && path != '/box/' + $routeParams.boxid && path != '/profile' && path != '/logs')
					$location.path('/home').replace();
				$rootScope.signStatus = true;
				if (path != '/box/' + $routeParams.boxid && path != '/logs')
					$rootScope.getUserBoxes();
			} else {
				$rootScope.authKey = '';
				$rootScope.signStatus = false;
				var path = $location.path();
				if (path == '/home' || path == '/box/' + $routeParams.boxid || path == '/profile' || path == '/logs')
					$location.path('/login').replace();
			}
		};
	});
