var app = angular.module('proApp', ['ngRoute', 'oc.lazyLoad', 'angular-clipboard']);

app.config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			redirectTo: '/home'
		})
		.when('/home', {
			templateUrl: 'pages/home.html',
			controller: 'homeCtrl'
		})
		.when('/box/:boxid', {
			templateUrl: 'pages/box.html',
			controller: 'boxCtrl'
		})
		.when('/login', {
			templateUrl: 'pages/login.html',
			controller: 'loginCtrl'
		})
		.when('/register', {
			templateUrl: 'pages/register.html',
			controller: 'regCtrl'
		})
		.when('/acctMgmt', {
			templateUrl: 'pages/acctMgmt.html',
			controller: 'acctMgmtCtrl'
		})
		.when('/password', {
			templateUrl: 'pages/password.html',
			controller: 'passCtrl'
		})
		.when('/profile', {
			templateUrl: 'pages/profile.html',
			controller: 'profileCtrl'
		})
		.when('/error', {
			templateUrl: 'pages/error.html'
		})
		.otherwise({
			redirectTo: '/error'
		});
});


// Global Controller
app.controller('globalCtrl', function ($rootScope, $location, $http, $routeParams) {
	$rootScope.getUserBoxes = function () {
		$http({
			method: 'GET',
			url: 'https://proapi.co/root/user/data',
			params: {
				'uid': $rootScope.uid
			}
		}).then(function (res) {
			$rootScope.userData = res.data;
		}, function () {
			alert('Some error occurred, Internet Problem!!');
		});
	};
	$rootScope.checkAuth = function () {
		if (Cookies.get('uid')) {
			$rootScope.uid = Cookies.get('uid');
			if (!$location.path() === '/box/' + $routeParams.boxid)
				$location.path('/home').replace();
			$rootScope.signStatus = true;
			$rootScope.getUserBoxes();
		} else {
			$rootScope.uid = '';
			$rootScope.signStatus = false;
			var path = $location.path();
			if (path == '/home' || path == '/box/' + $routeParams.boxid)
				$location.path('/login').replace();
		}
	};
});

// Home Page Controller
app.controller('homeCtrl', function ($scope, $http, $ocLazyLoad, $location, $timeout, $rootScope, $window) {
	$rootScope.checkAuth();
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.js');
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.css');
	$rootScope.signOut = function () {
		swal({
			title: 'Success',
			text: 'You have successfully Signed Out !!',
			type: 'success',
			timer: 1000,
			showConfirmButton: true
		}, function () {
			Cookies.remove('uid');
			console.log('Successfully Signed Out');
			$timeout(function () {
				$location.path('/login').replace();
			}, 2000);
		});
	};
	$scope.openModal = function () {
		$('#createBoxModal').modal('show');
	};
	$scope.createBox = function () {
		console.log('qq');
		if (/^[a-zA-Z]+$/.test($scope.box.id)) {
			$scope.box.uid = $rootScope.uid;
			$http({
				method: 'POST',
				url: 'https://proapi.co/root/user/box',
				data: $scope.box
			}).then(function (res) {
				if (res.data.status == true) {
					$('#createBoxModal').modal('hide');
					swal({
						title: 'Success',
						text: 'Box created Successfully!!',
						type: 'success',
						timer: 1000,
						showConfirmButton: true
					});
					$timeout(function () {
						$window.location.reload();
					}, 2000);
				} else {
					swal({
						title: 'Failed',
						text: res.data.msg,
						type: 'error',
						timer: 2000,
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

// Registration Page Controller
app.controller('regCtrl', function ($scope, $http, $ocLazyLoad, $location, $timeout, $rootScope) {
	$rootScope.checkAuth();
	$scope.user = {};
	$scope.errDiv = false;
	$scope.errMsg = '';
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.js');
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.css');
	$scope.createUser = function () {
		if ($scope.user.email && $scope.user.pass1 && $scope.user.pass2 && $scope.user.uname) {
			if ($scope.user.pass1 === $scope.user.pass2) {
				if ($scope.user.pass1.length >= 8) {
					$scope.errDiv = false;
					$scope.data = {};
					$scope.data.email = $scope.user.email;
					$scope.data.pass = $scope.user.pass1;
					$scope.data.uname = $scope.user.uname;
					$http({
						method: 'POST',
						url: 'https://proapi.co/root/user/create',
						data: $scope.data
					}).then(function (res) {
						if (res.data.status == true) {
							swal({
								title: 'Success',
								text: 'You have successfully registered !! Redirecting ...',
								type: 'success',
								timer: 1000,
								showConfirmButton: true
							});
							$timeout(function () {
								$location.path('/login').replace();
							}, 2000);
						} else {
							swal({
								title: 'Failed',
								text: res.data.msg,
								type: 'error',
								timer: 2000,
								showConfirmButton: true
							});
						}
					}, function (res) {
						swal("Fail", "Some error occurred, try again.", "error");
					});
				} else {
					$scope.errDiv = true;
					$scope.errMsg = 'Password length should be atleast 8';
				}
			} else {
				$scope.errDiv = true;
				$scope.errMsg = 'Passwords are not same';
			}
		} else {
			$scope.errDiv = true;
			$scope.errMsg = 'Input Fields are empty';
		}
	};
});

// Login Page Controller
app.controller('loginCtrl', function ($scope, $http, $ocLazyLoad, $location, $timeout, $rootScope) {
	$rootScope.checkAuth();
	$scope.user = {};
	$scope.errDiv = false;
	$scope.errMsg = '';
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.js');
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.css');
	$scope.loginUser = function () {
		if ($scope.user.email && $scope.user.pass) {
			$scope.errDiv = false;
			$http({
				method: 'POST',
				url: 'https://proapi.co/root/user/auth',
				data: $scope.user
			}).then(function (res) {
				if (res.data.status == true)
					swal({
						title: 'Success',
						text: 'You have successfully Signed In !!',
						type: 'success',
						timer: 1000,
						showConfirmButton: true
					}, function () {
						uid = res.data.uid;
						Cookies.set('uid', uid);
						$timeout(function () {
							$location.path('/home').replace();
						}, 2000);
					});
				else
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
		} else {
			$scope.errDiv = true;
			$scope.errMsg = 'Input Fields are empty';
		}
	};
});

// Send Password Reset Request Controller
app.controller('passCtrl', function ($scope, $http, $timeout, $rootScope, $ocLazyLoad, $location) {
	$rootScope.checkAuth();
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.js');
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.css');
	$scope.sendResetPasswordEmail = function () {
		if ($scope.resetEmail) {
			$http({
				method: 'GET',
				url: 'https://proapi.co/root/user/pass',
				params: {
					'email': $scope.resetEmail
				}
			}).then(function (res) {
				if (res.data.status) {
					swal({
						title: 'Success',
						text: 'Email send successfully !!',
						type: 'success',
						showConfirmButton: true
					}, function () {
						$timeout(function () {
							$location.path('/login').replace();
						}, 2000);
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
				console.log('Some error occurred !!');
			});
		}
	};
});

// Password Account Management Password & Verify Email Page Controller
app.controller('acctMgmtCtrl', function ($scope, $rootScope, $routeParams, $http, $ocLazyLoad, $location, $timeout) {
	$rootScope.checkAuth();
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.js');
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.css');
	$scope.verifyEmail = function () {
		if ($scope.code) {
			$http({
				method: 'GET',
				url: 'https://proapi.co/root/user/create',
				params: {
					code: $scope.code
				}
			}).then(function (res) {
				if (res.data.status) {
					swal({
						title: 'Success',
						text: 'Email verified successfully !!',
						type: 'success',
						showConfirmButton: true
					}, function () {
						$timeout(function () {
							$location.path('/login').replace();
						}, 2000);
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
		} else {

		}
	};
	$scope.code = $routeParams.oobCode;
	$scope.mode = $routeParams.mode;
	if (!($scope.mode == 'resetPassword' || $scope.mode == 'verifyEmail') || !$scope.code) {
		$location.path('/login?');
	}
	$scope.resetPassword = function () {
		if ($scope.pass1.length >= 8 && $scope.pass2.length >= 8 && $scope.code)
			if ($scope.pass1 === $scope.pass2)
				$http({
					method: 'POST',
					url: 'https://proapi.co/root/user/reset',
					data: {
						code: $scope.code,
						pass: $scope.pass1
					}
				}).then(function (res) {
					if (res.data.status)
						swal("Success", "Passeord successfully reset.", "success");
					else
						swal("Failure", res.data.msg, "error");
				});
			else
				swal("Failure", "Passwords are not same", "error");
		else
			swal("Failure", "Fields are empty / check password strength", "error");
	};
});

// Profile Controller
app.controller('profileCtrl', function ($scope, $rootScope, $routeParams, $http, $ocLazyLoad, $location, $timeout) {
	$rootScope.checkAuth();
});

// Box Controller
app.controller('boxCtrl', function ($scope, $routeParams, $ocLazyLoad, $rootScope, $http, $timeout, $window, $location) {
	$rootScope.checkAuth();
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.js');
	$ocLazyLoad.load('./js/plugins/sweetalert/sweetalert.min.css');
	$scope.boxId = $routeParams.boxid;
	$scope.getUserBox = function () {
		$http({
			method: 'GET',
			url: 'https://proapi.co/root/user/box',
			params: {
				uid: $rootScope.uid,
				bid: $scope.boxId
			}
		}).then(function (res) {
			$scope.boxData = res.data;
		}, function () {
			console.log('Some error occurred !!');
		});
	};
	$scope.getUserBox();
	$scope.openCreateApiModal = function () {
		$('#createApiModal').modal('show');
	};
	$scope.type = ['GET', 'POST', ];
	$scope.copySuccess = function () {
		swal("Success", "Copied to Clipboard", "success");
	};
	$scope.createApi = function () {
		if ($scope.apiId.length >= 3 && /^[a-zA-Z]+$/.test($scope.apiId) && $scope.apiName) {
			$http({
				method: 'POST',
				url: 'https://proapi.co/root/user/box/api',
				data: {
					name: $scope.apiName,
					url: $scope.apiUrl,
					uid: $rootScope.uid,
					bid: $scope.boxId,
					type: $scope.apiType,
					aid: $scope.apiId
				}
			}).then(function (res) {
				if (res.data.status == true) {
					$('#createApiModal').modal('hide');
					swal({
						title: 'Success',
						text: 'Api added Successfully!!',
						type: 'success',
						timer: 1000
					});
					$timeout(function () {
						$window.location.reload();
					}, 2000);
				} else {
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
	$scope.openViewApiModal = function (key, x) {
		$('#viewApiModal').modal('show');
		$scope.apiModal = x;
		$scope.apiModal.aid = key;
		console.log($scope.apiModal);
	};
	$scope.openDeleteApiModal = function () {
		$('#viewApiModal').modal('hide');
		$('#deleteApiModal').modal('show');
	};
	$scope.openDeleteBoxModal = function () {
		$('#deleteBoxModal').modal('show');
	};
	$scope.deleteBox = function () {
		$http({
			method: 'POST',
			url: 'https://proapi.co/root/user/box/delete',
			data: {
				uid: $rootScope.uid,
				bid: $scope.boxId
			}
		}).then(function (res) {
			if (res.data.status == true) {
				$('#deleteBoxModal').modal('hide');
				swal({
					title: 'Success',
					text: 'Box deleted Successfully!!',
					type: 'success',
					timer: 1000
				});
				$timeout(function () {
					$location.path('/home')
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
			url: 'https://proapi.co/root/user/box/api/delete',
			data: {
				uid: $rootScope.uid,
				bid: $scope.boxId,
				aid: $scope.apiId
			}
		}).then(function (res) {
			if (res.data.status == true) {
				$('#deleteApiModal').modal('hide');
				swal({
					title: 'Success',
					text: 'Api deleted Successfully!!',
					type: 'success',
					timer: 1000
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
