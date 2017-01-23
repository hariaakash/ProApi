// Send Password Reset Request Controller
angular.module('proApp')
	.controller('forgotPasswordCtrl', function ($scope, $http, $timeout, $rootScope, $location) {
		$rootScope.checkAuth();
		$scope.sendResetPasswordEmail = function () {
			if ($scope.resetEmail) {
				$http({
					method: 'GET',
					url: 'http://localhost:3000/user/password/request',
					params: {
						'email': $scope.resetEmail
					}
				}).then(function (res) {
					swal({
						title: 'Success',
						text: res.data.msg,
						type: 'success',
						showConfirmButton: false
					});
				}, function () {
					swal({
						title: 'Failed',
						text: 'Some error occurred !!',
						type: 'error',
						showConfirmButton: true
					});
				});
			}
		};
	});
