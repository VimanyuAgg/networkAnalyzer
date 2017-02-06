
var app=angular.module("networkSniffer",['ngRoute']).
config(function($routeProvider){
	$routeProvider
	.when("/traffic_stats", {
		templateUrl:"templates/live-stats.html",
		controller:"PlotCtrl"
	})
	.when("/network_stats", {
		templateUrl: '/templates/network-stats.html',
		controller:'PlotCtrl'
		
	})
	.when("/highest_stats",{
		templateUrl: '/templates/highest-stats.html',
		controller: 'PlotCtrl'
	})
	.otherwise({redirectTo: "/traffic_stats"})
})
.controller("homeController",function($scope){

	
})
