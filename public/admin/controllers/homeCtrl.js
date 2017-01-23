// Home Page Controller
angular.module('proApp')
	.controller('homeCtrl', function ($scope, $http, $rootScope) {
		$rootScope.checkAuth();
		$rootScope.signOut = function () {
			$http({
				method: 'POST',
				url: 'http://localhost:3000/admin/signout',
				data: {
					authKey: $rootScope.authKey
				}
			}).then(function (res) {
				Cookies.remove('authKey');
				swal({
					title: 'Success',
					text: 'You have successfully Signed Out !!',
					type: 'success',
					timer: 2000,
					showConfirmButton: false
				}).then(function () {}, function (dismiss) {
					if (dismiss == 'timer')
						location.reload();
				});
			});
		};
		$rootScope.getAdminData();
	});
