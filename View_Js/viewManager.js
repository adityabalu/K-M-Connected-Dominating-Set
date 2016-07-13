/*
This file will be used to alter the view of the page 
*/
$(document).ready(function() {	
	var message; //result message of some algorithms

	//Paint Wu & Li's step dominators ========================================
	function paintDominators(){
		var tempNode;	
		//paint every node with the initial color
		for(var j=0; j<network.nodes.length; j++){
			network.nodes[j].graphic.attr({ circle: {fill: DEFAULTFILL}});
		}
		if(dominatorListWL.length > 0){	
			for(var i=0; i< dominatorListWL.length; i++){
				tempNode = returnNodeById(dominatorListWL[i]);
				tempNode.graphic.attr({ circle: {fill: DOMINATOR_WL_FILL}});	
			}
		}
		if( (dominatorListKM.length > 0) ){
			for(var i=0; i< dominatorListKM.length; i++){
				tempNode = returnNodeById(dominatorListKM[i]);
				tempNode.graphic.attr({ circle: {fill: DOMINATOR_KM_FILL}});	
			}
		}
	}
	//Buttons ==================================================================================
	$("#final_results").hide();

	$("#k_m_alert").dialog({ 
		resizable: false,
      	height:200,
      	modal: true,
      	minWidth: 400,
      	autoOpen:false,
      	buttons: {
        	"OK": function() {
         	 $( this ).dialog( "close" );
        	}
      	},
      	dialogClass: "dialogTheme"
	 });

	//Prevent non numeric input
	$("#k_input").keydown(function(event) {
		// Ensure that it is a number and stop the keypress
        var key = event.which || event.keyCode;
        if( (key == 8) || (key == 9) || (key == 27) ){
        	//just allow it
        }
        else if( (key< 48) || (key > 57) ){
        	event.preventDefault();
        }
	});

	$("#m_input").keydown(function(event) {
		// Ensure that it is a number and stop the keypress
        var key = event.which || event.keyCode;
        if( (key == 8) || (key == 9) || (key == 27) ){
        	//just allow it
        }
        else if( (key< 48) || (key > 57) ){
        	event.preventDefault();
        }
	});

	$("#results_btn").click(function() {
		$(".btn").removeClass("btn_clicked");
		$("#results_btn").addClass("btn_clicked");
		finalResultsStringWL = "<p class=\"text-info\"><b>Initially we use the Wu && Li algorithm to get a minimum CDS</b></p>";
		finalResultsStringKM = "<p class=\"text-info\"><b>K,M algorithm results</b></p>";
		k = parseInt($("#k_input").val());
		m = parseInt($("#m_input").val());
		if( isNaN(k) || isNaN(m) ){
			$("#k_m_alert").dialog("open");
		}
		calculateWuLi();
	//	message = k_m_algorithm();
		paintDominators();
		$("#final_results").html(finalResultsStringWL+finalResultsStringKM);
		$("#final_results").show(200);	
	});

	$("#clear_btn").click(function() {
		//Reinitialize the main global variables
		graph.clear();
		network.nodes = [];
		dominatorListWL = [];	//the dominators after Wu & Li's algorithm
		dominatorListKM = [];	//the dominators after the K,M algorithm
		finalResultsStringWL = "<p>Initially we use the Wu && Li algorithm to obtain a minimum CDS</p>";
		finalResultsStringKM = "<p class=\"text-info\"><b>K,M algorithm results</b></p>";
		k = -1;					//The k of the k,m connected problem
		m = -1;
		usedIds = []; 									
		panelOffset = $("#graph_panel").offset();		
		addingNode = false; 							
		removingNode = false;							
		linkSelect1 = false;							
		linkSelect2 = false;							
		linkStart = null;										
		linkEnd = null; 	 
		message = "";
	});
});