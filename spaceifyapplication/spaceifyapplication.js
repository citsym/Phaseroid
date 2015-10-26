
/**
 * SpaceifyApplication, 14.4.2015 Spaceify Inc.
 * 
 * @class SpaceifyApplication
 *
 * This is the class that implements functionality common to all Spaceify applications
 *
 */

var fs = require("fs");
var url = require("url");


var HTTP_PORT = 8080;
var HTTPS_PORT = 6080;

var API_PATH = "./api/";
var SHARED_MODULES_PATH = "./api/node_modules/";
var MANIFEST_PATH = "./";
var APPLICATION_WWW_PATH = "./www/";
var APPLICATION_TLS_PATH = "./tls/";
var API_WWW_PATH = "./spaceifyapplication/api/www/";

//In real spaceify, use

//var API_WWW_PATH = Config.API_WWW_PATH;
//var APPLICATION_TLS_PATH = Config.APPLICATION_TLS_PATH;
//var APPLICATION_WWW_PATH = Config.APPLICATION_WWW_PATH;
//var API_PATH = "/api/";
//var MANIFEST_PATH = Config.APPLICATION_PATH;

var fibrous = require(SHARED_MODULES_PATH+"fibrous");
var logger = require(API_PATH+"logger");
var Utility = require(API_PATH+"utility");
var Config = require(API_PATH+"config")();
var WebServer = require(API_PATH+"webserver");



Manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH+"spaceify.manifest", "utf8"));

var WebSocketRpcConnection = require("./websocketrpcconnection.js");
var RpcCommunicator = require("./rpccommunicator.js");
var WebSocketServer = require("./websocketserver.js");

function ProvidedService(serviceName)
{
var self = this;

var communicator = new RpcCommunicator();
var webSocketServer = new WebSocketServer();
var secureWebSocketServer = new WebSocketServer();

webSocketServer.setConnectionListener(communicator);
secureWebSocketServer.setConnectionListener(communicator);

self.start = function(port, securePort, key, certificate, authorityCertificate)
	{
	webSocketServer.listen({host: "", port: port}, function(err,data)
		{
		if (err)
			console.log(err);
		});
	console.log("websocketsever of "+serviceName+ " started on port "+port);
	secureWebSocketServer.listen({host: null, port: securePort, is_secure: true, key: key, crt: certificate, ca_crt: authorityCertificate}, function(err,data)
		{
		if (err)
			console.log(err);
		});
	console.log("Secure websocketsever of " +serviceName + " started on port " +securePort);
	};

self.stop = function()
	{
	webSocketServer.close();
    secureWebSocketServer.close();
    };

self.getCommunicator = function()
	{
	return communicator;
	};
}

function SpaceifyApplication()
{
var self = this;


var requiredServices = {};
var providedServices = {};	//a providedservice contains a websocketserver, secureWebSocketServer, communicator	


var httpServer = new WebServer();
var httpsServer = new WebServer();
	
//var coreConnection = new WebSocketRpcConnection();

var serviceConnections = {};
	
var www_path = APPLICATION_WWW_PATH;

var ca_crt = API_WWW_PATH + Config.SPACEIFY_CRT;
var key = APPLICATION_TLS_PATH + Config.SERVER_KEY;
var crt = APPLICATION_TLS_PATH + Config.SERVER_CRT;

self.start = fibrous( function(app)
	{
	try
		{
		console.log("SpaceifyApplication::start() "+Manifest.name);
		
		// Establish a RPC connection to the Spaceify Core
		
		//coreConnection.connect.sync({host: Config.EDGE_HOSTNAME, port: Config.CORE_PORT_WEBSOCKET, persistent: true, owner: Manifest.name});
		//console.log("core connected");
		
		
		// Start applications http and https web servers
		httpServer.connect.sync({hostname: null, port: HTTP_PORT, www_path: www_path, owner: Manifest.name});
		console.log("httpsever started on port "+HTTP_PORT);
		httpsServer.connect.sync({hostname: null, port: HTTPS_PORT, is_secure: true, key: key, crt: crt, ca_crt: ca_crt, www_path: www_path, owner: Manifest.name});
		console.log("httpssever started on port "+HTTPS_PORT);
		
		// Connect to required services
		console.log("Starting to connect to required services");
		
		if (Manifest.requires_services)
			{
			for (var i=0; i<Manifest.requires_services.length; i++)
				{
				var data = coreConnection.sync.callRpc("getService", [Manifest.requires_services[i].service_name,""],self);
				var connection = new WebSocketRpcConnection();
				var opts = {};
				opts.host = Config.EDGE_HOSTNAME;
				opts.port = data.port;
				connection.sync.connect(opts);
				serviceConnections[Manifest.requires_services[i].service_name] = connection;
				}
			}			
		// Register provided services
		console.log("starting to register services");	
		
		if (Manifest.provides_services)
			{
			var serviceName = "";
			var port = Config.FIRST_SERVICE_PORT;
			var securePort = Config.FIRST_SERVICE_PORT_SECURE;
			
			for (var i=0; i<Manifest.provides_services.length; i++)
				{
				serviceName = Manifest.provides_services[i].service_name;
				
				console.log("registering service "+ serviceName);
				
				providedServices[serviceName] = new ProvidedService(serviceName);	
				providedServices[serviceName].start(port, securePort, key, crt, ca_crt);	
				
				//coreConnection.sync.callRpc("registerService", serviceName, self);
				
				port++;
				securePort++
				}
			}	
		//Call the initialize method of the actual application
		
		app.sync.start();
		
		communicator.setConnectionListener(app);
		
		// Notify the core application initialialized itself successfully
		coreConnection.sync.callRpc("initialized", [true, null],self);
		}
	catch(err)
		{
		logger.error(err.message);

		// Notify the core application failed to initialialize itself. The error message can be passed to the core.
		coreConnection.sync.call("initialized", [false, err.message], self);

		stop.sync();
		}
	finally
		{
		coreConnection.sync.close();
		}
	});
	
self.stop = fibrous( function()
	{
	httpServer.sync.close();
	httpsServer.sync.close();
	
	for (key in providedServices)
	        providedServices[key].stop();
	});

self.getRequiredService = function(serviceName) 
	{
	return serviceConnections[serviceName].getCommunicator();	
	};	
	
self.getProvidedService = function(serviceName)
    {
	return providedServices[serviceName].getCommunicator();
	};
	
}

if (typeof exports !== "undefined")
	{
	module.exports = new SpaceifyApplication();
	}
