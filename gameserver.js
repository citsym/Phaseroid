"use strict";

var spaceify = require("./spaceifyapplication/spaceifyapplication.js");


function GameServer()
{
var self = this;

		

self.onClientConnected = function(id)
	{
	spaceify.getProvidedService("spaceify.org/services/gameclient").notifyAll("onClientConnected", [id]);
	spaceify.getProvidedService("spaceify.org/services/gamescreen").notifyAll("onClientConnected", [id]);
	};
	
self.onClientDisconnected = function(id)
	{
	spaceify.getProvidedService("spaceify.org/services/gameclient").notifyAll("onClientDisconnected", [id]);
	spaceify.getProvidedService("spaceify.org/services/gamescreen").notifyAll("onClientDisconnected", [id]);
	};	

self.onScreenConnected = function(id)
	{
	spaceify.getProvidedService("spaceify.org/services/gameclient").notifyAll("onScreenConnected", [id]);
	spaceify.getProvidedService("spaceify.org/services/gamescreen").notifyAll("onScreenConnected", [id]);
	};
	
self.onScreenDisconnected = function(id)
	{
	spaceify.getProvidedService("spaceify.org/services/gameclient").notifyAll("onScreenDisconnected", [id]);
	spaceify.getProvidedService("spaceify.org/services/gamescreen").notifyAll("onScreenDisconnected", [id]);
	};	


self.start = function()
	{	
	spaceify.getProvidedService("spaceify.org/services/gameclient").exposeRpcMethod("callScreenRpc", self, self.callScreenRpc);		
	spaceify.getProvidedService("spaceify.org/services/gameclient").exposeRpcMethod("callClientRpc", self, self.callClientRpc);		
	spaceify.getProvidedService("spaceify.org/services/gamescreen").exposeRpcMethod("callScreenRpc", self, self.callScreenRpc);
	spaceify.getProvidedService("spaceify.org/services/gamescreen").exposeRpcMethod("callClientRpc", self, self.callClientRpc);	
	
	/*
	spaceify.getProvidedService("spaceify.org/services/gameclient").exposeRpcMethod("callServerRpc", self, self.callServerRpc);		
	spaceify.getProvidedService("spaceify.org/services/gamescreen").exposeRpcMethod("callServerRpc", self, self.callServerRpc);
	*/
	
	spaceify.getProvidedService("spaceify.org/services/gameclient").setConnectionListener(self, self.onClientConnected);
	spaceify.getProvidedService("spaceify.org/services/gameclient").setDisconnectionListener(self, self.onClientDisconnected);
	
	spaceify.getProvidedService("spaceify.org/services/gamescreen").setConnectionListener(self, self.onScreenConnected);
	spaceify.getProvidedService("spaceify.org/services/gamescreen").setDisconnectionListener(self, self.onScreenDisconnected);
	};

var stop = function()
	{
	spaceify.stop();
	};




/***************************
* EXPOSED JSON-RPC METHODS *
***************************/

self.callScreenRpc = function(screenId, methodName, params, connectionId, callback)
	{
	console.log("GameServer::callScreenRpc() called");
	console.log(screenId);
	
	var screens = spaceify.getProvidedService("spaceify.org/services/gamescreen");
	if (screens)
		{
		params.push(connectionId);
		screens.callRpc(methodName, params, self, callback, screenId);
		}
	};

self.callClientRpc = function(clientId, methodName, params, connectionId, callback)
	{
	console.log("GameServer::callClientRpc() called");
	console.log(clientId);
	
	var clients = spaceify.getProvidedService("spaceify.org/services/gameclient");
	if (clients)
		{
		params.push(connectionId);
		clients.callRpc(methodName, params, self, callback, clientId);
		}
	};	
	
/*
self.callServerRpc = function(clientId, methodName, params, connectionId, callback)
	{
	console.log("GameServer::callServerRpc() called");
	console.log(methodName);
	console.log(params);
		
	
	};

}
*/



var gameServer = new GameServer();

spaceify.start(gameServer, function(err,data) 
	{
	if(err) 
		console.log(err);
	});	
	
