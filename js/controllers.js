angular.module('app.controllers', [])
  .controller('editor', ['$scope' , function($scope) {

    var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#myholder'),
        width: 1500,
        height:500,
        model: graph
    });
    var paper2 = new joint.dia.Paper({
        el: $('#myimage'),
        width: 1500,
        height:500,
        model: graph,
        interactive : false
    });


    var rects=new Object();
    var texts=[];
    var cnt = 1;
    var dsteps = [];
    var dcnt = 0;
    var parallel_inner = new Object();
    var parallel_outer = [];
    var links = [];

    var start = new joint.shapes.basic.Circle({
        position:{ x:400,y:50},
        attrs:{circle:{fill:'black'}, text : {text:'Start',fill:'white'}}
    });
    var end = new joint.shapes.basic.Circle({
        position:{ x:600,y:400},
        attrs:{circle:{fill:'black'}, text : {text:'End',fill:'white'}}
    });
    graph.addCells([start,end]);

    var StepImage = new joint.shapes.basic.Rect({
        position: { x: 700, y: 10 },
        size: { width: 100, height: 30 },

        attrs: { rect: { fill: 'blue'}, text: { text: 'Step',fill:'white' } }
    });
    var DStepImage = new joint.shapes.basic.Path({
            size: { width: 50, height: 50 },
            position: { x: 840, y: 10 },
            attrs: {
                path: { d: 'M 30 0 L 60 30 30 60 0 30 z' ,fill : 'green'},
                text: {
                    text: 'D',
                    'ref-y': .5 // basic.Path text is originally positioned under the element
                }
            }
    });
    var DeleteImage = new joint.shapes.basic.Rect({
        position: { x: 900, y: 10 },
        size: { width: 100, height: 30 },

        attrs: { rect: { fill: 'blue'}, text: { text: 'Delete',fill:'white' } }
    });
    graph.addCells([StepImage,DStepImage,DeleteImage]);
    paper.findViewByModel(StepImage).options.interactive = false;
    paper.findViewByModel(DStepImage).options.interactive = false;
    paper.findViewByModel(DeleteImage).options.interactive = false;

     // = AngularIssues.get({},{'id':1});

    function addDstep() {
        dcnt+=1;
        var rect = new joint.shapes.basic.Path({
            size: { width: 50, height: 50 },
            attrs: {
                path: { d: 'M 30 0 L 60 30 30 60 0 30 z' ,fill : 'green'},
                text: {
                    text: 'D' + dcnt,
                    'ref-y': .5 // basic.Path text is originally positioned under the element
                }
            }
        });
        dsteps.push(rect);
        graph.addCells([rect]);
    };
    $scope.addProcess = function(){
        addProcess();
    }
    $scope.addDstep = function(){
        addDstep();
    }
    function addProcess() {
            var rect = new joint.shapes.basic.Rect({
                position: { x: 100, y: 30 },
                size: { width: 100, height: 30 },
                attrs: { rect: { fill: 'blue',rx: 15, ry: 15}, text: { text: 'Step' + cnt, fill: 'white' } }
            });
            cnt+=1;
            rects[rect.id]=1;
            //rects.push(rect);
            graph.addCells([rect]);
    };
    $scope.joinProcess = function() {

        var link = new joint.dia.Link({
            source: { id: rects[$scope.process1].id },
            target: { id: rects[$scope.process2].id }
        });
        links.push([link.id,rects[$scope.process1].id,rects[$scope.process2].id]);
        graph.addCells([link]); 
    };
    $scope.removeProcess = function(){
        rects[$scope.rprocess].remove();
    };
    $scope.removeText = function(){
        texts[$scope.rtext].remove();
    };
    $scope.addText = function(){
        var txt = new joint.shapes.basic.Text({
            position: {x:100,y:30},
            size: { width:100 , height:30},
            attrs: {text: {text: $scope.textdata }}
        });
        texts.push(txt);
        graph.addCells([txt]);
    }

    var state = 0;
    var click_id;

    function check_link(id1,id2){
        var fl=1;
        var allLinks=graph.getLinks();
        for (var i = 0; i <allLinks.length; i++) {
            for (var j=0; j < links.length; j++) { 
                if(links[j][1] == id1 && links[j][2] == id2 && links[j][0]==allLinks[i].id)
                {
                    fl=0;
                    break;
                }
            };
            if(fl==0)
            {
                break;
            }
        };

        return fl;
    }
    function check_in(cell){
            var incoming = graph.getConnectedLinks(cell, { inbound: true });
            if(incoming.length==0)
            {
                return 1;
            }
            else
            {
                return 0;
            }
    }
    function check_out(cell){
            var outgoing = graph.getConnectedLinks(cell, { outbound: true });        
            if(outgoing.length==0)
            {
                return 1;
            }
            else
            {
                return 0;
            }
    }
    function onclick_join(cellView,ect,x,y) {
         if(state==0)
        {
            if(cellView.model.id!=StepImage.id && cellView.model.id!=DStepImage.id && cellView.model.id!=DeleteImage.id)
            {
                paper.$el.addClass('connecting');
                click_id=cellView.model;
                state=1;
            }
        }
        else
        {
            if(cellView.model.id==DeleteImage.id && click_id.id!=start.id && click_id.id!=end.id)
            {
                click_id.remove();
            }
            if(cellView.model.id!=click_id.id)//&& cellView instanceof joint.shapes.basic)
            {
                //checking if a link already present                    
                 if(check_link(cellView.model.id,click_id.id) && (cellView.model.id!=StepImage.id && cellView.model.id!=DStepImage.id && cellView.model.id!=DeleteImage.id))
                 {
                    if(rects[cellView.model.id] && rects[click_id.id])
                    {
                        if((check_in(click_id) && check_out(cellView.model)))
                        {
                             
                            var ln = new joint.dia.Link({
                                source: { id: cellView.model.id }, target: { id: click_id.id },
                                attrs: { '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' } }
                            });
                            links.push([ln.id,cellView.model.id,click_id.id]);
                            graph.addCell([ln]);
                        }
                    }
                    else if(rects[cellView.model.id] && !rects[click_id.id])
                    {
                        if((check_out(cellView.model)))
                        {
                             
                            var ln = new joint.dia.Link({
                                source: { id: cellView.model.id }, target: { id: click_id.id },
                                attrs: { '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' } }
                            });
                            links.push([ln.id,cellView.model.id,click_id.id]);
                            graph.addCell([ln]);
                        }
                    }
                    else if(!rects[cellView.model.id] && rects[click_id.id])
                    {
                        if((check_in(click_id)))
                        {
                             
                            var ln = new joint.dia.Link({
                                source: { id: cellView.model.id }, target: { id: click_id.id },
                                attrs: { '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' } }
                            });
                            links.push([ln.id,cellView.model.id,click_id.id]);
                            graph.addCell([ln]);
                        }
                    }
                    else
                    {
                            var ln = new joint.dia.Link({
                                source: { id: cellView.model.id }, target: { id: click_id.id },
                                attrs: { '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' } }
                            });
                            links.push([ln.id,cellView.model.id,click_id.id]);
                            graph.addCell([ln]);                       
                    }
                }
            }
            paper.$el.removeClass('connecting');
            state=0;
        }           
    }

    function ondrag_join (cellView,evt,x,y) {
        var elementBelow = graph.get('cells').find(function(cell) {
            if (cell instanceof joint.dia.Link) return false; // Not interested in links.
            if (cell.id === cellView.model.id) return false; // The same element as the dropped one.
            if (cell.getBBox().containsPoint(g.point(x, y))) {
                return true;
            }
            return false;
        });

        if (elementBelow && !_.contains(graph.getNeighbors(elementBelow), cellView.model)) {
        graph.addCell(new joint.dia.Link({
            source: { id: cellView.model.id }, target: { id: elementBelow.id },
            attrs: { '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' } }
        }));
            // Move the element a bit to the side.
            cellView.model.translate(-200, 0);
        }
    }
    function add_rect(x_val,y_val){
        var rect = new joint.shapes.basic.Rect({
                position: { x: x_val, y: y_val },
                size: { width: 100, height: 30 },
                attrs: { rect: { fill: 'blue',rx: 15, ry: 15}, text: {} }
        });
        graph.addCells([rect]);
    }

    function outer_box(x_val,y_val,steps){
        var rect = new joint.shapes.basic.Rect({
                position: { x: x_val, y: y_val },
                size: { width: steps*55, height: 100 },
                attrs: { rect: { rx: 15, ry: 15}, text: {} }
        });
        graph.addCells([rect]); 
        parallel_outer.push(rect);
        var cur_ar = [];
        for (var i = 0; i < steps; i++) {
            var rect2 = new joint.shapes.basic.Rect({
                    position: { x: x_val+55*i, y: y_val+40 },
                    size: { width: 50, height: 30 },
                    attrs: { rect: {  fill: 'blue', rx: 15, ry: 15 }, text: { text: 'Step' + cnt, fill: 'white' } }
            });
            rect.embed(rect2);       
            cur_ar.push(rect2);
            graph.addCells([rect2]);     
            paper.findViewByModel(rect2).options.interactive = false;
        };
        cnt+=1;
        parallel_inner[rect]=cur_ar;

        //alert(parallel_outer[0].id);  
    }

    function is_child(cellView){
        for (var i =0;i < parallel_outer.length ; i++) {
            var cur = parallel_inner[parallel_outer[i]];
            for (var j = 0;j < cur.length ; j++) {
                if(cur[j].id == cellView.model.id)
                {
                    return 0;
                }
            };
        };
        return 1;
    }

    $scope.add_parallel = function (){
        var steps = $scope.parallel_steps;
        var st_x = 100;st_y=100;
        if(steps==0)
        {
            alert('Atleast one step is required!!!');
        }
        else
        {
            outer_box(st_x,st_y,steps);
        }
    }

    $scope.verify =function (){
        //Start step should have an outgoing link
        var inboundStart = graph.getConnectedLinks(start, { inbound: true });
        var outboundEnd = graph.getConnectedLinks(end, { outbound: true });
       alert(inboundStart.length)
        if(inboundStart.length==0)
        {
            alert("No link from start");
        }
        if(outboundEnd.length==0)
        {
            alert("No link to end");
        }
      //  var stepLinks = 
        //alert(outboundLinks);
        /*paper.findViewByModel(start).options.inbound=true;
        alert(graph.getConnectedLinks(start));*/
        //Stop step should have an incoming link
        //Every normal step should have 

    }
    //We can have pointerup but that will not be optimal
    paper.on('cell:pointerclick', function(cellView, evt, x, y) {
        if (is_child(cellView))
        {
            onclick_join(cellView,evt,x,y);
        }
        else//Here we can join with the parent
        {
            paper.$el.removeClass('connecting');
            state = 0;
        }
    });
    paper.on('cell:pointerup',function(cellView, evt, x, y){
        if(cellView.model.id == StepImage.id)
        {
            addProcess();
        }
        if(cellView.model.id == DStepImage.id)
        {
            addDstep();
        }
    });
    paper.on('blank:pointerclick', function(evt, x, y) {
            //If someone clicks on the black part then state will be reset  
               paper.$el.removeClass('connecting');
               state=0;
    });

               
    var check;
    $scope.graph_to_json = function(){
        //Create json object for graph
        var json_object = graph.toJSON();
        check = json_object;
        $('#message').text(JSON.stringify(json_object));
    }
    function json_to_graph (json_object){
        var jsonString = JSON.stringify(json_object);
        graph.fromJSON(JSON.parse(jsonString));
    }
    $scope.load_graph = function(){
        json_to_graph(check);
    }
    $scope.get_rest = function(){
        $('#message').text(AngularIssues.query());
    }

}]);

angular.module('app.controller2', [])
  .controller('add_task', ['$scope','AngularIssues','AngularIssue','FormService' , function($scope  , AngularIssues , AngularIssue , FormService) {
    $scope.as= "asd";
    $scope.types = AngularIssues.query();

    //Define model for the dropdown
    $scope.myColor = $scope.types[0];
    $scope.task_type = "Form";
    $scope.show_type = FormService.query();
    $scope.myshow_type = $scope.show_type[0];


    $scope.show_list = function(){
        $scope.result = AngularIssues.query();
    }

    $scope.show_single = function(){
        var single = AngularIssue.query(function(){
                    $scope.result2 = single[0].m_name;         
        });
        
    }

    $scope.add_task = function(){

    }

    $scope.add_one = function(){
        var single = AngularIssue.query(function(){

                var value = single[0];
                value.m_name = "Ashish";
                value.$save();
        });
    }
}]);