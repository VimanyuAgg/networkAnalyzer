(function(){
    angular.module("networkSniffer").controller('PlotCtrl',function($scope){
        

        var dataArray = [];

        var dataJSON = [];
        var srcDestDict = {};
        $scope.totalPacket = 0;
        $scope.totalTraffic = 0;
        $scope.totalNodes = 0;
        $scope.totalConnections = 0;
        $scope.totalTypes = [];
        
        $scope.serverOutboundPacketString= "1,2,3,4,5,6,7";
        $scope.OutboundPacketList = [];
        $scope.showIndividualDetails = false;
        $scope.serverInboundTraffic = 0;
        $scope.serverOutboundTraffic = 0;
        $scope.serverInboundPacket = 0;
        $scope.serverOutboundPacket = 0;
        $scope.serverInboundConnections = [];
        $scope.serverOutboundConnections = [];

        $scope.serverMaxInboundPacket = "";
        $scope.serverMaxInboundPacketType = "Type: Unknown";

        $scope.serverMaxOutboundPacket = "";
        $scope.serverMaxOutboundPacketType = "Type: Unknown";

        $scope.serverMaxInboundTraffic = "";
        $scope.serverMaxInboundTrafficType = "Type: Unknown";

        $scope.serverMaxOutboundTraffic = "";
        $scope.serverMaxOutboundTrafficType = "Type: Unknown";
        
        $scope.selectedServerName="";
        

        $scope.sourceServerList=[];
        
        console.log("inside controller");


        function DataFetcher(urlFactory, delay) {
            var self = this;

            console.log("inside datafetcher");
            self.repeat = false;
            self.delay = delay;
            self.timer = null;
            self.requestObj = null;

            function getNext() {

                console.log("inside getnext");

                self.requestObj = $.ajax({
                    url: urlFactory()
                }).done(function(response) {
                    console.log("Response===========> "+response);
                    $(self).trigger("stateFetchingSuccess", {
                        result: response
                    });
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    $(self).trigger("stateFetchingFailure", {
                        error: textStatus
                    });
                }).always(function() {
                    if (self.repeat && _.isNumber(self.delay)) {
                        self.timer = setTimeout(getNext, self.delay);
                    }
                });
            }




            self.start = function(shouldRepeat) {
                console.log("inside start");
                self.repeat = shouldRepeat;
                console.log("inside start2");
                getNext();
            };

            self.stop = function() {
                self.repeat = false;
                clearTimeout(self.timer);
            };

            self.repeatOnce = function() {
                getNext();
            };

            self.setDelay = function(newDelay) {
                this.delay = newDelay;
            };
        }

        function addNewEntry($container, contentHTML) {
            var $innerSpan = $("<p/>").text(contentHTML),
                $newEntry = $("<li/>").append($innerSpan);

            $container.append($newEntry);
        }

        var $trafficStatusList = $("#mockTrafficStat"), df2 = new DataFetcher(function() {return "/traffic_status";});

        $(df2).on({
            "stateFetchingSuccess": function(event, data) {
                console.log("Inside on Request==========>");
                console.log(data);
                dataArray.push(data);

                console.log("dataArray====>");
                console.log(JSON.stringify(dataArray[0].result.data).length);
                console.log($trafficStatusList);

                dataJSON = JSON.parse(JSON.stringify(dataArray[0].result.data));
                $scope.totalConnections = dataJSON.length; 
                console.log("JSONDATA Object has ====>"+dataJSON.length);
                separateSources(dataJSON);
                
                //console.log("selectedServer---------->"+$scope.selectedServerName);
                data.result.data.forEach(function(dataEntry) {
                    addNewEntry($trafficStatusList, JSON.stringify(dataEntry));
                });
            },
            "stateFetchingFailure": function(event, data) {
                console.log("Inside on Request"+data);
                addNewEntry($trafficStatusList, JSON.stringify(data.error));
                addNewEntry($trafficStatusList, "Hit a snag. Retry after 1 sec...");
                setTimeout(function() {
                    $trafficStatusList.html("");
                    df2.repeatOnce();
                }, 1000);
            }
        });


        function separateSources(allData){
            var counter =0;
            var maxInboundTraffic = 0;
            var maxOutboudTraffic =0;
            var maxInboundPacket =0;
            var maxOutboundPacket =0;
            var maxInboundConn =0;
            var maxOutboundConn =0;

            for(var i =0;i<allData.length;i++){
                $scope.totalPacket += allData[i].packets;
                $scope.totalTraffic += allData[i].traffic;

                if(allData[i].packets > maxInboundPacket){
                    maxInboundPacket = allData[i].packets;
                    $scope.serverMaxInboundPacket = allData[i].destObj;
                    $scope.serverMaxOutboundPacket = allData[i].srcObj;
                    
                    if(allData[i].destType != undefined)
                    $scope.serverMaxInboundPacketType = allData[i].destType;
                    if (allData[i].srcType != undefined)
                    $scope.serverMaxOutboundPacketType = allData[i].srcType;

                }

                if(allData[i].traffic > maxInboundTraffic){
                    maxInboundTraffic = allData[i].traffic;
                    $scope.serverMaxInboundTraffic = allData[i].destObj;
                    $scope.serverMaxOutboundTraffic = allData[i].srcObj;

                    if(allData[i].destType != undefined)
                    $scope.serverMaxInboundTrafficType = allData[i].destType;
                    if (allData[i].srcType != undefined)
                    $scope.serverMaxOutboundTrafficType = allData[i].srcType;
                }


                //console.log(allData[i]);

                if($scope.sourceServerList.indexOf(allData[i].srcObj) === -1){
                    $scope.sourceServerList.push(allData[i].srcObj);
                }
                
                $scope.totalNodes = $scope.sourceServerList.length;
                console.log(allData[i]);
                if( allData[i].srcObj in srcDestDict)
                {
                    srcDestDict[allData[i].srcObj] += allData[i].destObj+";";

                }
                else
                {
                    srcDestDict[allData[i].srcObj] = allData[i].destObj+";";
                }

                if($scope.totalTypes.indexOf(allData[i].srcType) === -1 ){
                    $scope.totalTypes.push(allData[i].srcType);
                }
                counter++;
            }

            $scope.$digest();
            console.log("THIS IS SERVER SOURCE LIST"+$scope.sourceServerList);
            console.log("counter is "+counter);
            console.log("total Packets captured: "+$scope.totalPacket+"\ntotal Traffic analyzed: "+$scope.totalTraffic);

            console.log(srcDestDict);
        }

        //$scope.$watch('sourceServerList');

        df2.start();


        var framedelay = 500;

        var schedulestory = new dagred3Story("#schedule", "Schedule Network",framedelay);

        var schedulestory_network = new dagred3Story("#schedule_network", "Schedule Network",framedelay);

        //Working graph in below function
        function makeJSONGraph(server){
            
            var svg = d3.select("svg > g");
            svg.selectAll("*").remove();
            
            for(var i =0;i<dataJSON.length;i++){
                if(dataJSON[i].srcObj== server){
                    
                    schedulestory.animateStory(0,[
                    [ ["setActivity", dataJSON[i].srcObj]
                    ,
                    ["setActivity", dataJSON[i].destObj]
                    ,
                    ["AddCoherenceEdge", dataJSON[i].srcObj,dataJSON[i].destObj]]
                       ]);
               
                }

                if(dataJSON[i].destObj== server){
                    schedulestory.animateStory(0,[
                    [ ["setActivity", dataJSON[i].srcObj]
                    ,
                    ["setActivity", server]
                    ,
                    ["AddCoherenceEdge", dataJSON[i].srcObj,server]]
                    ]);    
                }
                
            }

        }

        $scope.makeJSONGraph_Network= function (){

            var counter = 0;
            for(var i =0;i<dataJSON.length;i++){
                counter++;

                schedulestory_network.animateStory(0,[
                    [ ["setActivity", dataJSON[i].srcObj]
                    ,
                    ["setActivity", dataJSON[i].destObj]
                    ,
                    ["AddCoherenceEdge", dataJSON[i].srcObj,dataJSON[i].destObj]]
                       ]);

                       if(counter > 80){break;}
            }

        }       
        

        $scope.generateGraph = function(server){
           console.log("Inside graph generator");
           $scope.selectedServerName = server;
           makeJSONGraph($scope.selectedServerName);
           console.log($scope.selectedServerName);
           console.log(server);
          
          var trafficList = [];
          
          
           for( var i=0;i<dataJSON.length;i++){
               if (dataJSON[i].srcObj === $scope.selectedServerName){
                   $scope.OutboundPacketList.push(dataJSON[i].packets);
                   
                   $scope.serverOutboundConnections.push(dataJSON[i].destObj);
                   $scope.serverOutboundTraffic +=dataJSON[i].traffic;
                   $scope.serverOutboundPacket += dataJSON[i].packets;

               }

               if(dataJSON[i].destObj === $scope.selectedServerName)
               {
                   $scope.serverInboundConnections.push(dataJSON[i].srcObj);
                   $scope.serverInboundTraffic +=dataJSON[i].traffic;
                   $scope.serverInboundPacket += dataJSON[i].packets;

               }
           }
           
            $scope.showIndividualDetails = true;                      
        }


      
    });

})();