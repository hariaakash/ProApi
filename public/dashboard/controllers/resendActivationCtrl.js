// Resend Email Activation
angular.module('proApp')
	.controller('resendActivationCtrl', function ($scope, $http, $timeout, $rootScope, $location) {
		$rootScope.checkAuth();
		$scope.resendActivationEmail = function () {
			if ($scope.resetEmail) {
				$http({
					method: 'GET',
					url: 'http://localhost:3000/user/resendActivation',
					params: {
						'email': $scope.resetEmail
					}
				}).then(function (res) {
					$location.path('/login');
					swal({
						title: 'Success',
						text: res.data.msg,
						type: 'success',
						showConfirmButton: true
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
