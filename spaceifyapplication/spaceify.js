"use strict";

function Spaceify()
{
var self = this;

var EDGE_IP = "10.0.0.1";
var CORE_ADDRESS = {host: EDGE_IP, port: 2947};

var serviceConnections = {};
var coreConnection = new WebSocketRpcConnection();


var initializeConnections = function(callback)
	{
	coreConnection.connect(CORE_ADDRESS, function()
		{
		console.log("Websocket Connected to the Core");	
		callback();
		});	
	};

var createServiceConnection = function(serviceName, callback)
	{
	coreConnection.callRpc("getService",[serviceName,""], self, function(err, data)
		{
		var connection = new WebSocketRpcConnection();
		var opts = {};
		opts.host = EDGE_IP;
		opts.port = data.port;
		
		connection.connect(opts, function()
			{
			serviceConnections[serviceName] = connection;	
			callback();
			});	
		});
	};

var recurseServiceConnections = function(serviceNames, callback)
	{
	if (serviceNames.length > 0)	
		{
		createServiceConnection(serviceNames.pop(), function()
			{
			if (serviceNames.length > 0)
				recurseServiceConnections(serviceNames, callback);
			else	
				callback();			
			});	
		}
	};

self.connect = function(serviceNames, callback)
	{
	initializeConnections(function()	
		{
		recurseServiceConnections(serviceNames, function()
			{
			callback();
			});
		});
	};
			
self.getConnection = function(serviceName) 
	{
	return serviceConnections[serviceName].getCommunicator();	
	};

self.startSpacelet = function(spaceletName)
	{
	};	
}

var spaceify = new Spaceify();


