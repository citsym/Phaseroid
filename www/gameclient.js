"use strict";


function getGetParameter(val) 
	{
    var result = null,
    tmp = [];
    location.search.substr(1).split("&").forEach(function (item) 
    	{
        tmp = item.split("=");
        if (tmp[0] === val) 
        		result = decodeURIComponent(tmp[1]);
    	});
    return result;
	}

function GameClient()
{
var self = this;

var screens = new Object();
var clients = new Object();

var clientConnectionListener = null;
var clientDisconnectionListener = null;
var screenConnectionListener = null;
var screenDisconnectionListener = null;

var serverConnection = new WebSocketRpcConnection();


self.callScreenRpc = function(screenId, methodName, params, object, callback)
	{
	serverConnection.getCommunicator().callRpc("callScreenRpc", [screenId, methodName, params], object, callback);	
	};
	
self.callClientRpc = function(clientId, methodName, params, object, callback)
	{
	serverConnection.getCommunicator().callRpc("callClientRpc", [clientId, methodName, params], object, callback);	
	};

self.exposeRpcMethod = function(name, object_, method_)
	{
	serverConnection.getCommunicator().exposeRpcMethod(name, object_, method_);
	};

self.getConnectedClientIds = function()
	{
	return Object.keys(clients);
	};

self.getConnectedScreenIds = function()
	{
	return Object.keys(screens);
	};

self.setClientConnectionListener = function(object_, listener_)
	{
	clientConnectionListener = {object: object_, listener: listener_}; 
	};
	
self.setClientDisconnectionListener = function(object_, listener_)
	{
	clientDisconnectionListener = {object: object_, listener: listener_};
	};	

self.setScreenConnectionListener = function(object_, listener_)
	{
	screenConnectionListener = {object: object_, listener: listener_}; 
	};
	
self.setScreenDisconnectionListener = function(object_, listener_)
	{
	screenDisconnectionListener = {object: object_, listener: listener_};
	};	


//Events from the game server

self.onClientConnected = function(id)
	{
	console.log("GameClient::onClientConnected() "+id);
	clients[id] = true;
	
	if (clientConnectionListener)
		{
		clientConnectionListener.listener.call(clientConnectionListener.object, id);
		}
	};
	
self.onClientDisconnected = function(id)
	{
	console.log("GameClient::onClientDisconnected() "+id);
	if (clients[id])
		delete clients[id];
	
	if (clientDisconnectionListener)
		{
		clientDisconnectionListener.listener.call(clientDisconnectionListener.object, id);
		}
	};
	
self.onScreenConnected = function(id)
	{
	console.log("GameClient::onScreenConnected() "+id);
	screens[id] = true;
	if (screenConnectionListener)
		{
		screenConnectionListener.listener.call(screenConnectionListener.object, id);
		}
	};
	
self.onScreenDisconnected = function(id)
	{
	console.log("GameClient::onScreenDisconnected() "+id);
	if (screens[id])
		delete screens[id];
	
	if (screenDisconnectionListener)
		{
		screenDisconnectionListener.listener.call(screenDisconnectionListener.object, id);
		}
	};	
		
self.connect = function(host, port, id, callback)
	{
	var opts = {};
	opts.host = host;
	opts.port = port;
	if (id)
		opts.id = id;
	
	serverConnection.connect(opts, function()
		{
		self.exposeRpcMethod("onClientConnected", self, self.onClientConnected);	
		self.exposeRpcMethod("onClientDisconnected", self, self.onClientDisconnected);	
		self.exposeRpcMethod("onScreenConnected", self, self.onScreenConnected);	
		self.exposeRpcMethod("onScreenDisconnected", self, self.onScreenDisconnected);	
		
		callback();
		});		
	};
				
}

var gameClient = new GameClient();