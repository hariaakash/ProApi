// Home Page Controller
angular.module('proApp')
	.controller('homeCtrl', function ($scope, $http, $rootScope) {
		$rootScope.checkAuth();
		$rootScope.signOut = function () {
			$http({
				method: 'POST',
				url: 'https://proapi.co/user/signout',
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
					showConfirmButton: true
				}).then(function () {}, function (dismiss) {
					if (dismiss == 'timer')
						location.reload();
				});
			});
		};
		$scope.openModal = function () {
			$('#createBoxModal').modal('show');
		};
		$scope.createBox = function () {
			if (/^[a-zA-Z]+$/.test($scope.box.boxId)) {
				$scope.box.authKey = $rootScope.authKey;
				$http({
					method: 'POST',
					url: 'https://proapi.co/box/create',
					data: $scope.box
				}).then(function (res) {
					if (res.data.status == true) {
						$('#createBoxModal').modal('hide');
						swal({
							title: 'LOADING',
							text: 'Box created Successfully!!',
							type: 'success',
							timer: 2000,
							showConfirmButton: false
						}).then(function () {}, function (dismiss) {
							if (dismiss == 'timer')
								location.reload();
						});
					} else {
						$('#createBoxModal').modal('hide');
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
				swal("Fail", "Check your input.", "error");
			}
		};
	});
