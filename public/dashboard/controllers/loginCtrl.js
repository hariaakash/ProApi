// Login Page Controller
angular.module('proApp')
	.controller('loginCtrl', function ($scope, $http, $location, $rootScope) {
		$rootScope.checkAuth();
		$scope.user = {};
		$scope.loginUser = function () {
			$http({
				method: 'POST',
				url: 'https://proapi.co/user/auth',
				data: $scope.user
			}).then(function (res) {
				if (res.data.status == true) {
					var authKey = res.data.authKey;
					Cookies.set('authKey', authKey);
					$location.path('/home').replace();
					swal({
						title: 'Success',
						text: 'You have successfully Signed In !!',
						type: 'success',
						showConfirmButton: true
					});
				} else
					swal({
						title: 'Failed',
						text: res.data.msg,
						type: 'error',
						timer: 2000,
						showConfirmButton: true
					});
			}, function (res) {
				swal("Fail", "Some error occurred, try again.", "error");
			});
		};
	});
