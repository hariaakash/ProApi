// Logs Controller
angular.module('proApp')
	.controller('logsCtrl', function ($scope, $rootScope, $http) {
		$rootScope.checkAuth();
		$scope.currentPage = 1;
		$scope.pageSize = 10;
		$scope.logsData = {};
		if ($scope.logsData.status != true)
			$http({
				method: 'GET',
				url: 'http://localhost:3000/user/logs',
				params: {
					authKey: $rootScope.authKey
				}
			})
			.then(function (res) {
				if (res.data.status) {
					$scope.logsData = res.data.logs;
				}
			})
			.catch(function (err) {
				swal({
					title: 'Some error occurred',
					type: 'error'
				});
			});
	});
