// Password Account Management Password & Verify Email Page Controller
angular.module('proApp')
	.controller('acctMgmtCtrl', function ($scope, $rootScope, $routeParams, $http, $location) {
		$rootScope.checkAuth();
		$scope.verifyEmail = function () {
			if ($scope.code) {
				$http({
					method: 'POST',
					url: 'https://proapi.co/user/verifyEmail',
					data: {
						code: $scope.code,
						email: $scope.email
					}
				}).then(function (res) {
					if (res.data.status) {
						$location.search({});
						$location.path('/login');
						swal({
							title: 'Success',
							text: 'Email verified successfully !!',
							type: 'success',
							showConfirmButton: true
						});
					} else {
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							showConfirmButton: true
						});
					}
				}, function () {
					alert('Some error occurred, Internet Problem!!');
				});
			}
		};
		$scope.code = $routeParams.oobCode;
		$scope.email = $routeParams.email;
		$scope.mode = $routeParams.mode;
		if (!($scope.mode == 'forgotPassword' || $scope.mode == 'verifyEmail') || !$scope.code) {
			$location.search({});
			$location.path('/login');
		}
		$scope.resetPassword = function () {
			if ($scope.pass1.length >= 8 && $scope.pass2.length >= 8 && $scope.code && $scope.email)
				if ($scope.pass1 === $scope.pass2)
					$http({
						method: 'POST',
						url: 'https://proapi.co/user/password/verify',
						data: {
							code: $scope.code,
							password: $scope.pass1
						}
					}).then(function (res) {
						if (res.data.status) {
							$location.search({});
							$location.path('/login');
							swal("Success", res.data.msg, "success");
						} else
							swal("Failure", res.data.msg, "error");
					});
				else
					swal("Failure", "Passwords are not same", "error");
			else
				swal("Failure", "Fields are empty / check password strength", "error");
		};
	});
