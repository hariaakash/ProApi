// Box Controller
angular.module('proApp')
	.controller('boxCtrl', function ($scope, $routeParams, $rootScope, $http, $timeout, $window, $location) {
		$rootScope.checkAuth();
		$scope.boxId = $routeParams.boxid;
		$scope.boxData = {};
		$scope.getUserBox = function () {
			if ($scope.boxData.status != true)
				$http({
					method: 'GET',
					url: 'https://proapi.co/box',
					params: {
						authKey: $rootScope.authKey,
						boxId: $scope.boxId
					}
				}).then(function (res) {
					if (res.data.status) {
						$scope.boxData = res.data;
						$rootScope.userData.info.uname = $scope.boxData.uname;
						$("#sparkline").sparkline([$scope.boxData.boxStats.success, $scope.boxData.boxStats.fails], {
							type: 'pie',
							height: '150px',
							sliceColors: ['#1ab394', '#ec4758']
						});
					} else {
						$location.path('/login');
						swal({
							title: 'Info',
							text: res.data.msg,
							type: 'info',
							showConfirmButton: true
						});
					}
				}, function () {
					swal("Failure", "Some error occurred, try again.", "error");
				});
		};
		$scope.getUserBox();
		$scope.openCreateApiModal = function () {
			$('#createApiModal').modal('show');
		};
		$scope.type = ['GET', 'POST'];
		$scope.copySuccess = function () {
			swal("Success", "Copied to Clipboard", "success");
		};
		$scope.openViewApiModal = function (x) {
			$('#viewApiModal').modal('show');
			$scope.apiModal = x;
		};
		$scope.openDeleteApiModal = function () {
			$('#viewApiModal').modal('hide');
			$('#deleteApiModal').modal('show');
		};
		$scope.openDeleteBoxModal = function () {
			$('#deleteBoxModal').modal('show');
		};
		$scope.createApi = function () {
			$scope.data = {
				authKey: $rootScope.authKey,
				boxId: $scope.boxId,
				apiName: $scope.apiName,
				apiId: $scope.apiId,
				apiType: $scope.apiType,
				apiUrl: $scope.apiUrl
			};
			if (/^[a-zA-Z]+$/.test($scope.apiId)) {
				$http({
					method: 'POST',
					url: 'https://proapi.co/apis/create',
					data: $scope.data
				}).then(function (res) {
					if (res.data.status == true) {
						$('#createApiModal').modal('hide');
						swal({
							title: 'Success',
							text: 'Api added Successfully! Loading...',
							type: 'success',
							timer: 2000,
							showConfirmButton: false
						});
						$timeout(function () {
							$window.location.reload();
						}, 2000);
					} else {
						$('#createApiModal').modal('hide');
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							timer: 2000,
							showConfirmButton: true
						});
					}
				}, function (res) {
					swal("Failure", "Some error occurred, try again.", "error");
				});
			} else {
				swal({
					title: 'Failed',
					text: 'Check your inputs',
					type: 'error',
					showConfirmButton: true
				});
			}
		};
		$scope.deleteBox = function () {
			$http({
				method: 'POST',
				url: 'https://proapi.co/box/delete',
				data: {
					authKey: $rootScope.authKey,
					boxId: $scope.boxId
				}
			}).then(function (res) {
				if (res.data.status == true) {
					$('#deleteBoxModal').modal('hide');
					swal({
						title: 'Success',
						text: res.data.msg,
						type: 'success',
						timer: 2000,
						showConfirmButton: false
					}).then(function () {});
					$timeout(function () {
						$window.location.reload();
					}, 2000);
				} else {
					swal("Failure", "Some error occurred, try again.", "error");
				}
			}, function (res) {
				swal("Failure", "Some error occurred, try again.", "error");
			});
		};
		$scope.deleteApi = function () {
			$http({
				method: 'POST',
				url: 'https://proapi.co/apis/delete',
				data: {
					authKey: $rootScope.authKey,
					boxId: $scope.boxId,
					apiId: $scope.apiId
				}
			}).then(function (res) {
				if (res.data.status == true) {
					$('#deleteApiModal').modal('hide');
					swal({
						title: 'Success',
						text: 'Api deleted Successfully!!',
						type: 'success',
						showConfirmButton: false
					});
					$timeout(function () {
						$window.location.reload();
					}, 2000);
				} else {
					swal("Failure", "Some error occurred, try again.", "error");
				}
			}, function (res) {
				swal("Failure", "Some error occurred, try again.", "error");
			});
		};
	});
