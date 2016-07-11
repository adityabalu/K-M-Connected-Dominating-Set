/*
This file will handle the algorithm functionality. It will use the
network object created in network_manager.js
*/

var dominatorListWL = [];	//the dominators after Wu & Li's algorithm
var dominatorListKM = [];	//the dominators after the K,M algorithm
var finalResultsStringWL = "<p class=\"text-info\"><b>Initially we use the Wu && Li algorithm to obtain a minimum CDS</b></p>";
var k = -1;					//The k of the k,m connected problem
var m = -1; 				//The m of the k,m connected problem


//Returns true if the given node has a neighbor with the given id ======================
function hasNeighbor(node, id){

	for(var i=0; i<node.neighbors.length; i++){
		if(id == node.neighbors[i]){
			return true;
		}
	}

	return false;
}

//checks if one list is a subset of the superSet
//We asume that the lists contain numeric values only
function isSubsetOf(list, superSet){
	var found;

	for(var i=0; i<list.length; i++){
		found=false;
		for(var j=0; j<superSet.length; j++){
			if(list[i] == superSet[j]){
				found = true;
			}
		}
		if(!found){
			return false;
		}
	}	

	return true;
}

/* 
This function will use the Wu & Li algorithm to find a minimum ========================
CDS, but not k,m connected	
*/
function calculateWuLi(){

	if(network.nodes.length > 2){
			
		var nodesArray = network.nodes;
		var neighborsConnected = true;
		var tempNode;
		dominatorListWL = [];

		console.log("The network ", network );
		console.log("Beginning Wu & Li ===========>");

		//Initial decision without Rule1 && Rule 2 ========
		//for every node
		for(var i=0; i<nodesArray.length; i++){
			console.log("Current node : ", nodesArray[i].id);
			//for every neighbor of that node
			for(var j=0; j<nodesArray[i].neighbors.length; j++){
				//get a list of all the other neighbors than the current one
				neighborCheckList = nodesArray[i].neighbors.filter(function(el){
					return el != nodesArray[i].neighbors[j]; 
				});
				console.log("Checking neighbor : ", nodesArray[i].neighbors[j]);
				console.log("Remaining neighbors to check : ", neighborCheckList);

				if(neighborCheckList.length > 0){
					//Is j connected to all the other neighbor nodes?
					tempNode = returnNodeById(nodesArray[i].neighbors[j]);
					for(var k=0; k<neighborCheckList.length; k++){
						if( !hasNeighbor(tempNode, neighborCheckList[k]) ){
							neighborsConnected = false;
							console.log("The following neighbors are unconnected : ", tempNode.id, " , ", neighborCheckList[k]);
							break;
						}
					}
				}

				if(!neighborsConnected){
					nodesArray[i].dominator = true;
					dominatorListWL.push(nodesArray[i].id);
					neighborsConnected = true;
					break; //no need to check the other neighbors
				}

			}
		}

		finalResultsStringWL += "<p>Dominators after first step : " + dominatorListWL +"</p>";
		
		//Rule 1 ==================================================
		
		var curNode;
		var checkNodeList;
		var otherDom;

		console.log("Beginning WL Rule 1 =====>");

		//Traverse the list of the dominators
		var p=0;
		var resetP = false;
		var reducedNeighborSet; 

		while( p<dominatorListWL.length){
			console.log("Checking dominator : ", dominatorListWL[p]);
			//get the dominator node object
			curNode = returnNodeById(dominatorListWL[p]);
			//get the rest of the dominators
			checkNodeList = dominatorListWL.filter(function(el){
				return el != dominatorListWL[p];
			});

			console.log("Remaining dominators : ",checkNodeList);
			//for every other dominator, check if the neighbors of p are a
			//subset of the neighbors of that other dominator
			for(var d=0; d<checkNodeList.length; d++){
				otherDom = returnNodeById(checkNodeList[d]);
				//If you're checking for subsets, don't include in your neighborset the node you're checking against
				//if he is your neighbor.Otherwise the subset comparison will check if the other node has himself
				//as a neighbor, which will be always false.
				reducedNeighborSet = curNode.neighbors.filter(function(index) { 
					return index != checkNodeList[d];
				});
				if(isSubsetOf(reducedNeighborSet, otherDom.neighbors)){
					if(curNode.id < otherDom.id){
						curNode.dominator = false;
						dominatorListWL = checkNodeList;
						resetP = true;
						console.log("Node ", curNode.id, " will be replaced by ", otherDom.id);
						console.log("New dominators list : ", dominatorListWL);
					}
				}
			}

			if(resetP){
				p = 0;
				resetP = false;
			}
			else{
				p++;
			}

		}

		finalResultsStringWL += "<p>Dominators after Rule 1 : " + dominatorListWL +"</p>";

		//Rule 2 ================================================
		var g=0;
		var resetG = false;
		var curDom;
		var domNeighbors;
		var remainingDomNeighbors;
		var unionSet;
		var reducedChecklist;

		console.log("Beginning WL Rule 2 ============>");
		//Traverse the dominators list
		while(g < dominatorListWL.length){
			//get the current node
			curDom = returnNodeById(dominatorListWL[g]);
			console.log("Current dominator : ",curDom);
			//get the dominator neighbors only
			domNeighbors = curDom.neighbors.filter(function(index) {
				return returnNodeById(index).dominator == true ;
			});
			console.log("Check against : ", domNeighbors);
			//for each one of these neighbors
			for(var n=0; n<domNeighbors.length; n++){
				//get all the other neighbors
				remainingDomNeighbors = domNeighbors.filter(function(index) {
					return index != domNeighbors[n];
				});
				//and check if this one is connected with any one of the others
				//if so, we must check if the union of their neighbor sets can
				//contain all the neighbors of curDom
				for(var t=0; t<remainingDomNeighbors.length; t++){
					if(hasNeighbor( returnNodeById(domNeighbors[n]), remainingDomNeighbors[t]) ){
						unionSet = _.union(returnNodeById(domNeighbors[n]).neighbors, 
										   returnNodeById(remainingDomNeighbors[t]).neighbors );

						console.log("United the sets of : ", domNeighbors[n], remainingDomNeighbors[t]);
						console.log("Union result : ",unionSet);

						//If you're checking for subsets, don't include in your neighborset the node you're checking against
						//if he is your neighbor.Otherwise the subset comparison will check if the other node has himself
						//as a neighbor, which will be always false.
						reducedChecklist = curDom.neighbors.filter(function(index) {
							return ( (index != domNeighbors[n]) && (index != remainingDomNeighbors[t]) );
						});

						if(isSubsetOf(reducedChecklist, unionSet) && (curDom.id<domNeighbors[n]) && (curDom.id < remainingDomNeighbors[t]) ){
							curDom.dominator = false;
							dominatorListWL = dominatorListWL.filter(function(index) {
								return index != curDom.id;
							});
							resetG = true;
							console.log("Node", curDom.id , " replaced by : ", domNeighbors[n], remainingDomNeighbors[t]);
						}
					}
				}


			}

			if(resetG){
				g=0;
				resetG = false;
			}
			else{
				g++;
			}

		}

		finalResultsStringWL += "<p>Dominators after Rule 2 : " + dominatorListWL +"</p>";

	}
	else{
		finalResultsStringWL = "<p>Network too small yet</p>";
	}

}




