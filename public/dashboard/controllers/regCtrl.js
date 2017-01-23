// Registration Page Controller
angular.module('proApp')
	.controller('regCtrl', function ($scope, $http, $location, $timeout, $rootScope) {
		$rootScope.checkAuth();
		$scope.createUser = function () {
			if ($scope.user.pass1 === $scope.user.pass2) {
				$scope.data = {};
				$scope.data.email = $scope.user.email;
				$scope.data.password = $scope.user.pass1;
				$scope.data.uname = $scope.user.uname;
				$scope.data.country = $scope.user.country;
				$scope.data.timezone = $scope.user.timezone;
				$http({
					method: 'POST',
					url: 'https://proapi.co/user/create',
					data: $scope.data
				}).then(function (res) {
					if (res.data.status == true) {
						swal({
							title: 'Success',
							text: res.data.msg,
							type: 'success',
							showConfirmButton: false
						});
					} else {
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							showConfirmButton: true
						});
					}
				}, function (res) {
					swal("Fail", "Some error occurred, try again.", "error");
				});
			} else {
				swal("Fail", "Password's are not same, try again.", "error");
			}
		};
	});
