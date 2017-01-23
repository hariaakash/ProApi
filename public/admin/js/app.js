angular.module('proApp', ['ngRoute', 'angularUtils.directives.dirPagination'])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				redirectTo: '/home'
			})
			.when('/login', {
				templateUrl: 'pages/login.html',
				controller: 'loginCtrl'
			})
			.when('/home', {
				templateUrl: 'pages/home.html',
				controller: 'homeCtrl'
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
		$rootScope.adminData = {};
		$rootScope.getAdminData = function () {
			if ($rootScope.adminData.status != true)
				$http({
					method: 'GET',
					url: 'http://localhost:3000/admin/data',
					params: {
						authKey: $rootScope.authKey
					}
				}).then(function (res) {
					$rootScope.adminData = res.data.data;
					$rootScope.adminData.uname = res.data.uname;
					console.log($rootScope.adminData);
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
				if (path != '/home')
					$location.path('/home').replace();
				$rootScope.signStatus = true;
			} else {
				$rootScope.authKey = '';
				$rootScope.signStatus = false;
				var path = $location.path();
				if (path == '/home')
					$location.path('/login').replace();
			}
		};
	});
